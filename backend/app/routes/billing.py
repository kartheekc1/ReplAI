"""Razorpay checkout — order creation, signature verification, and plan setup."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.models.schemas import CreateOrderIn, CreateOrderOut, VerifyPaymentIn
from app.services.razorpay_client import PRICING_INR, create_order, ensure_plans, verify_signature
from app.services.supabase_client import get_supabase
from app.utils.security import CurrentUser

router = APIRouter()
log = logging.getLogger("replyverse.billing")
settings = get_settings()


@router.get("/status")
async def status_check():
    """Public health probe — quick way to confirm the backend can see Razorpay keys.
    Never returns secrets, only booleans + the public key id (which is safe).
    """
    return {
        "ok": True,
        "razorpay_configured": bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET),
        "razorpay_key_id_prefix": settings.RAZORPAY_KEY_ID[:10] if settings.RAZORPAY_KEY_ID else None,
        "razorpay_mode": "live" if settings.RAZORPAY_KEY_ID.startswith("rzp_live_") else "test" if settings.RAZORPAY_KEY_ID else None,
        "supabase_configured": bool(settings.SUPABASE_JWT_SECRET and not settings.SUPABASE_JWT_SECRET.startswith("PASTE_")),
        "service_role_configured": bool(settings.SUPABASE_SERVICE_ROLE_KEY and not settings.SUPABASE_SERVICE_ROLE_KEY.startswith("PASTE_")),
    }


@router.get("/plans")
async def list_plans():
    """Public — used by the frontend to render pricing without hardcoding."""
    return {
        "currency": "INR",
        "plans": [
            {"id": "free",    "name": "Free",    "amount": 0,      "monthly_inr": 0},
            {"id": "starter", "name": "Starter", "amount": 34900,  "monthly_inr": 349},
            {"id": "pro",     "name": "Pro",     "amount": 49900,  "monthly_inr": 499},
            {"id": "agency",  "name": "Agency",  "amount": 129900, "monthly_inr": 1299},
        ],
    }


@router.post("/setup-plans")
async def setup_plans(_: CurrentUser):
    """Idempotently create Razorpay Subscription plans for each tier."""
    try:
        return {"ok": True, "plans": ensure_plans()}
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))


@router.post("/create-order", response_model=CreateOrderOut)
async def create_order_route(body: CreateOrderIn, user_id: CurrentUser):
    log.info("create-order request user=%s plan=%s currency=%s", user_id, body.plan, body.currency)

    # 1. Create the Razorpay order
    try:
        order = create_order(body.plan, body.currency)
    except ValueError as e:
        log.warning("create-order rejected: %s", e)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))
    except RuntimeError as e:
        log.error("create-order misconfigured: %s", e)
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    except Exception as e:  # razorpay.errors.BadRequestError, AuthenticationError, etc.
        log.exception("create-order failed at Razorpay")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Razorpay error: {type(e).__name__}: {e}")

    # 2. Make sure the user row exists in public.users (the auth trigger should have created it,
    #    but if not, the FK on payments would fail with a confusing error).
    sb = get_supabase()
    try:
        existing = sb.table("users").select("id").eq("id", user_id).maybe_single().execute()
        if not existing.data:
            log.info("creating missing public.users row for %s", user_id)
            # We don't know the email here — pull it from auth.users via the service role
            au = sb.auth.admin.get_user_by_id(user_id)
            email = au.user.email if au and au.user else f"{user_id}@unknown"
            sb.table("users").insert({"id": user_id, "email": email, "plan": "free"}).execute()
    except Exception as e:
        log.warning("user mirror check failed (will continue): %s", e)

    # 3. Record the order in payments
    try:
        sb.table("payments").insert(
            {
                "user_id": user_id,
                "razorpay_order_id": order["id"],
                "amount": order["amount"],
                "currency": order["currency"],
                "status": "created",
                "plan": body.plan,
            }
        ).execute()
    except Exception as e:
        log.exception("payments insert failed")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            f"Order created at Razorpay but DB insert failed: {type(e).__name__}: {e}",
        )

    log.info("create-order ok order_id=%s amount=%s", order["id"], order["amount"])
    return order


@router.post("/verify-payment")
async def verify_payment(body: VerifyPaymentIn, user_id: CurrentUser):
    ok = verify_signature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature)
    if not ok:
        log.warning("verify-payment signature mismatch order=%s payment=%s", body.razorpay_order_id, body.razorpay_payment_id)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid payment signature")

    sb = get_supabase()
    payment = (
        sb.table("payments")
        .update(
            {
                "status": "captured",
                "razorpay_payment_id": body.razorpay_payment_id,
                "captured_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("razorpay_order_id", body.razorpay_order_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not payment.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    plan = payment.data[0]["plan"]
    expiry = datetime.now(timezone.utc) + timedelta(days=30)

    sb.table("subscriptions").upsert(
        {
            "user_id": user_id,
            "plan": plan,
            "status": "active",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "expiry_date": expiry.isoformat(),
        },
        on_conflict="user_id",
    ).execute()
    sb.table("users").update({"plan": plan}).eq("id", user_id).execute()

    log.info("verify-payment ok user=%s plan=%s", user_id, plan)
    return {"ok": True, "plan": plan, "expires_at": expiry.isoformat()}
