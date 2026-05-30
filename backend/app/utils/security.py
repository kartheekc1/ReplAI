"""JWT verification using Supabase's signing secret.

The frontend uses the Supabase JS client; every authenticated request hits FastAPI
with `Authorization: Bearer <supabase-access-token>`. We verify that token using the
project's JWT secret (Settings → API → JWT) and pull `sub` (the auth user id).
"""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()


def decode_supabase_jwt(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {e}")


async def get_current_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    """Dependency that returns the current Supabase user_id (auth.users.id)."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    token = authorization.split(" ", 1)[1]
    payload = decode_supabase_jwt(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token has no subject")
    return user_id


CurrentUser = Annotated[str, Depends(get_current_user_id)]
