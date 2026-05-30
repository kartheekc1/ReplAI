"""Instagram OAuth + account management."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse

from app.config import get_settings
from app.models.schemas import IGAccountOut, IGCallbackIn
from app.services.instagram import InstagramClient
from app.services.supabase_client import get_supabase
from app.utils.security import CurrentUser

router = APIRouter()
settings = get_settings()


@router.get("/connect")
async def connect():
    """Redirect users to Instagram's OAuth screen."""
    scope = "instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list"
    url = (
        "https://api.instagram.com/oauth/authorize?"
        f"client_id={settings.META_APP_ID}"
        f"&redirect_uri={settings.META_REDIRECT_URI}"
        f"&scope={scope}"
        "&response_type=code"
    )
    return RedirectResponse(url)


@router.post("/callback", response_model=IGAccountOut)
async def callback(body: IGCallbackIn, user_id: CurrentUser) -> IGAccountOut:
    """Exchange the auth code for a long-lived token and persist the account."""
    short = await InstagramClient.exchange_code(body.code)
    short_token = short["access_token"]
    long_ = await InstagramClient.exchange_for_long_lived(short_token)
    token = long_["access_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=long_.get("expires_in", 60 * 24 * 3600))

    ig = InstagramClient(token)
    me = await ig.me()

    sb = get_supabase()
    row = {
        "user_id": user_id,
        "ig_user_id": me["id"],
        "username": me["username"],
        "followers": me.get("followers_count", 0),
        "access_token": token,
        "token_expires_at": expires_at.isoformat(),
        "status": "connected",
        "connected_at": datetime.now(timezone.utc).isoformat(),
    }
    result = (
        sb.table("instagram_accounts")
        .upsert(row, on_conflict="ig_user_id")
        .execute()
    )
    return IGAccountOut(**result.data[0])


@router.get("", response_model=list[IGAccountOut])
async def list_accounts(user_id: CurrentUser) -> list[IGAccountOut]:
    sb = get_supabase()
    res = sb.table("instagram_accounts").select("*").eq("user_id", user_id).execute()
    return [IGAccountOut(**r) for r in res.data]


@router.post("/disconnect/{account_id}")
async def disconnect(account_id: str, user_id: CurrentUser) -> dict:
    sb = get_supabase()
    sb.table("instagram_accounts").update({"status": "revoked"}).eq("id", account_id).eq(
        "user_id", user_id
    ).execute()
    return {"ok": True}


@router.get("/{account_id}/media")
async def media(account_id: str, user_id: CurrentUser) -> list[dict]:
    sb = get_supabase()
    acct = (
        sb.table("instagram_accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not acct.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
    ig = InstagramClient(acct.data["access_token"])
    return await ig.media()
