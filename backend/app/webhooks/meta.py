"""Meta Webhook handler — the heart of the automation pipeline.

Flow:
    Instagram comment / DM / story reply
      ↓
    Meta posts to POST /webhook
      ↓
    Verify signature, dispatch by field (comments | messages | story_insights)
      ↓
    For each event:
        1. Resolve the IG account → its ReplyVerse user_id
        2. Find a matching active automation by post_id + keyword
        3. Send the configured DM via Instagram Send API
        4. Persist the comment, message, and (optionally) the lead
        5. Bump analytics counters
"""

from __future__ import annotations

import hashlib
import hmac
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Query, Request, status

from app.config import get_settings
from app.services.instagram import InstagramClient
from app.services.supabase_client import get_supabase

router = APIRouter()
log = logging.getLogger("replyverse.webhook")
settings = get_settings()


# ----------------------- Verification handshake -----------------------

@router.get("")
async def verify(
    mode: str | None = Query(default=None, alias="hub.mode"),
    challenge: str | None = Query(default=None, alias="hub.challenge"),
    verify_token: str | None = Query(default=None, alias="hub.verify_token"),
):
    if mode == "subscribe" and verify_token == settings.META_VERIFY_TOKEN:
        return int(challenge or 0)
    raise HTTPException(status.HTTP_403_FORBIDDEN, "Verification failed")


# ----------------------- Event ingestion -----------------------

def _verify_signature(body: bytes, header: str | None) -> bool:
    """Validate X-Hub-Signature-256 from Meta."""
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(
        settings.META_APP_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, header.split("=", 1)[1])


@router.post("")
async def receive(
    request: Request,
    background: BackgroundTasks,
    x_hub_signature_256: str | None = Header(default=None, alias="X-Hub-Signature-256"),
):
    body = await request.body()
    if settings.META_APP_SECRET and not _verify_signature(body, x_hub_signature_256):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad signature")

    payload = await request.json()
    log.info("webhook payload object=%s entries=%d", payload.get("object"), len(payload.get("entry", [])))

    # Acknowledge fast; process async
    background.add_task(_dispatch, payload)
    return {"ok": True}


# ----------------------- Dispatch -----------------------

async def _dispatch(payload: dict[str, Any]) -> None:
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            field = change.get("field")
            value = change.get("value", {})
            try:
                if field == "comments":
                    await _handle_comment(entry["id"], value)
                elif field == "messages":
                    await _handle_message(entry["id"], value)
            except Exception:  # pragma: no cover
                log.exception("error processing %s event", field)


async def _handle_comment(ig_user_id: str, comment: dict[str, Any]) -> None:
    """A new comment landed on a post or reel."""
    sb = get_supabase()
    acct = (
        sb.table("instagram_accounts")
        .select("*")
        .eq("ig_user_id", ig_user_id)
        .single()
        .execute()
    )
    if not acct.data:
        log.warning("no account for ig_user_id=%s", ig_user_id)
        return
    account = acct.data
    user_id = account["user_id"]

    text = (comment.get("text") or "").lower()
    media_id = (comment.get("media") or {}).get("id")
    commenter = comment.get("from", {})
    commenter_id = commenter.get("id")
    commenter_username = commenter.get("username") or "unknown"

    # Find a matching automation
    autos = (
        sb.table("automations")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "active")
        .execute()
    )
    matched = None
    for a in autos.data or []:
        if a.get("post_id") and a["post_id"] != media_id:
            continue
        if any(k.lower() in text for k in (a.get("keywords") or [])):
            matched = a
            break
    if not matched:
        return

    # Log the comment
    sb.table("comments").insert(
        {
            "user_id": user_id,
            "automation_id": matched["id"],
            "username": commenter_username,
            "comment": comment.get("text"),
            "matched_keyword": next(
                (k for k in matched["keywords"] if k.lower() in text), None
            ),
            "ig_comment_id": comment.get("id"),
            "media_id": media_id,
        }
    ).execute()

    ig = InstagramClient(account["access_token"])

    # Optional: reply publicly
    if matched.get("reply_publicly") and comment.get("id"):
        try:
            await ig.reply_to_comment(comment["id"], "Sent you a DM! 📩")
        except Exception:
            log.warning("public reply failed", exc_info=True)

    # Send the DM
    if commenter_id:
        body = matched["message"]
        if matched.get("cta_url"):
            body += f"\n\n👉 {matched.get('cta_label') or 'Open'}: {matched['cta_url']}"
        try:
            res = await ig.send_dm(commenter_id, body)
            sb.table("messages").insert(
                {
                    "user_id": user_id,
                    "automation_id": matched["id"],
                    "recipient": commenter_username,
                    "recipient_id": commenter_id,
                    "message": body,
                    "status": "sent",
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                    "ig_message_id": res.get("message_id"),
                }
            ).execute()
            sb.rpc("increment_automation_dms", {"automation_id_in": matched["id"]}).execute()
        except Exception:
            log.exception("send_dm failed")
            sb.table("messages").insert(
                {
                    "user_id": user_id,
                    "automation_id": matched["id"],
                    "recipient": commenter_username,
                    "recipient_id": commenter_id,
                    "message": matched["message"],
                    "status": "failed",
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()


async def _handle_message(ig_user_id: str, message: dict[str, Any]) -> None:
    """Inbound DM — could be a story reply or a free-form message.

    We treat the first reply after a DM as a lead-capture moment if the message
    contains contact information patterns (email or phone).
    """
    import re

    sb = get_supabase()
    acct = (
        sb.table("instagram_accounts")
        .select("*")
        .eq("ig_user_id", ig_user_id)
        .single()
        .execute()
    )
    if not acct.data:
        return
    account = acct.data
    sender = (message.get("sender") or {}).get("id")
    text = message.get("message", {}).get("text") or ""

    email = next(iter(re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)), None)
    phone = next(iter(re.findall(r"\+?\d[\d\s\-]{8,}", text)), None)
    if not (email or phone):
        return

    sb.table("leads").insert(
        {
            "user_id": account["user_id"],
            "username": sender or "ig_user",
            "email": email,
            "phone": phone,
            "notes": "captured from DM reply",
        }
    ).execute()
