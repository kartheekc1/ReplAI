"""Thin wrapper around the Instagram Messaging + Graph APIs.

Docs:
  https://developers.facebook.com/docs/instagram-api/
  https://developers.facebook.com/docs/messenger-platform/instagram/
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import get_settings

log = logging.getLogger("replyverse.instagram")
settings = get_settings()


class InstagramClient:
    def __init__(self, access_token: str, base: str | None = None):
        self.token = access_token
        self.base = base or settings.META_GRAPH_BASE

    # ---------- OAuth ----------

    @staticmethod
    async def exchange_code(code: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.post(
                "https://api.instagram.com/oauth/access_token",
                data={
                    "client_id": settings.META_APP_ID,
                    "client_secret": settings.META_APP_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.META_REDIRECT_URI,
                    "code": code,
                },
            )
            r.raise_for_status()
            return r.json()

    @staticmethod
    async def exchange_for_long_lived(short_token: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.get(
                f"{settings.META_GRAPH_BASE}/access_token",
                params={
                    "grant_type": "ig_exchange_token",
                    "client_secret": settings.META_APP_SECRET,
                    "access_token": short_token,
                },
            )
            r.raise_for_status()
            return r.json()

    # ---------- Profile ----------

    async def me(self) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.get(
                f"{self.base}/me",
                params={
                    "fields": "id,username,account_type,media_count",
                    "access_token": self.token,
                },
            )
            r.raise_for_status()
            return r.json()

    async def media(self, limit: int = 24) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.get(
                f"{self.base}/me/media",
                params={
                    "fields": "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count",
                    "limit": limit,
                    "access_token": self.token,
                },
            )
            r.raise_for_status()
            return r.json().get("data", [])

    # ---------- Messaging ----------

    async def send_dm(self, recipient_id: str, text: str) -> dict[str, Any]:
        """Send an Instagram DM via the Send API.

        recipient_id is the Instagram-scoped user id (IGSID) received from the webhook.
        """
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.post(
                f"{self.base}/me/messages",
                params={"access_token": self.token},
                json={
                    "recipient": {"id": recipient_id},
                    "message": {"text": text},
                },
            )
            if r.status_code >= 400:
                log.warning("send_dm failed status=%s body=%s", r.status_code, r.text)
            r.raise_for_status()
            return r.json()

    async def reply_to_comment(self, comment_id: str, text: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.post(
                f"{self.base}/{comment_id}/replies",
                params={"access_token": self.token, "message": text},
            )
            r.raise_for_status()
            return r.json()
