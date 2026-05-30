"""Authentication routes.

Most flows happen directly in the browser via the Supabase JS SDK (email + Google),
so the backend mainly mirrors profile state into `public.users` and exposes
service-level helpers for the FastAPI layer.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import AuthOut, GoogleAuthIn, LoginIn, RegisterIn
from app.services.supabase_client import get_supabase

router = APIRouter()


@router.post("/register", response_model=AuthOut)
async def register(body: RegisterIn) -> AuthOut:
    sb = get_supabase()
    res = sb.auth.sign_up(
        {
            "email": body.email,
            "password": body.password,
            "options": {"data": {"name": body.name or ""}},
        }
    )
    user = res.user
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not create account")
    # Mirror into public.users (RLS allows the owner; trigger also handles this — see migrations)
    sb.table("users").upsert(
        {"id": user.id, "email": body.email, "name": body.name, "plan": "free"}
    ).execute()
    return AuthOut(
        user_id=user.id,
        email=body.email,
        access_token=getattr(res.session, "access_token", None) if res.session else None,
    )


@router.post("/login", response_model=AuthOut)
async def login(body: LoginIn) -> AuthOut:
    sb = get_supabase()
    res = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    if not res.session or not res.user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return AuthOut(
        user_id=res.user.id, email=body.email, access_token=res.session.access_token
    )


@router.post("/google", response_model=AuthOut)
async def google_login(_: GoogleAuthIn) -> AuthOut:
    # Google OAuth is handled client-side via supabase.auth.signInWithOAuth.
    # Surface this endpoint anyway so server-to-server code-exchange flows can
    # be added later without breaking the public API.
    raise HTTPException(
        status.HTTP_501_NOT_IMPLEMENTED,
        "Use Supabase JS client for Google OAuth; this stub exists for server-flow extension.",
    )
