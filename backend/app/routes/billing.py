"""Razorpay checkout — order creation, signature verification, and plan setup."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import CreateOrderIn, CreateOrderOut, VerifyPaymentIn
from app.services.razorpay_client import PRICING_INR, create_order, ensure_plans, verify_signature
from app.services.supabase_client import get_supabase
from app.utils.security import CurrentUser

router = APIRouter()


@router.get("/plans")
async def list_plans():
    """Public — used by the frontend to render pricing without hardcoding."""
    return {
        "currency": "INR",
        "plans": [
            {"id": "free",    "name": "Free",    "amount": 0,         "monthly_inr": 0},
            {"id": "starter", "name": "Starter", "amount": 34900,     "monthly_inr": 349},
            {"id": "pro",     "name": "Pro",     "amount": 49900,     "monthly_inr": 499},
            {"id": "agency",  "name": "Agency",  "amount": 129900,    "monthly_inr": 1299},
        ],
    }


@router.post("/setup-plans")
async def setup_plans(_: CurrentUser):
    """Create Razorpay Subscription plans for each tier.

    Idempotent per Razorpay - they de-duplicate by item.name. Returns the plan IDs
    you should save in env (RAZORPAY_PLAN_STARTER, RAZORPAY_PLAN_PRO, RAZORPAY_PLAN_AGENCY)
    or persist on the subscriptions table.
    """
    try:
        return {"ok": True, "plans": ensure_plans()}
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))


@router.post("/create-order", response_model=CreateOrderOut)
async def create_order_route(body: CreateOrderIn, user_id: CurrentUser):
    try:
        order = create_order(body.plan, body.currency)
    except ValueError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))

    sb = get_supabase()
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
    return order


@router.post("/verify-payment")
async def verify_payment(body: VerifyPaymentIn, user_id: CurrentUser):
    ok = verify_signature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature)
    if not ok:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid payment signature")

    sb = get_supabase()
    # Mark payment captured
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

    # Upsert subscription + bump user plan
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

    return {"ok": True, "plan": plan, "expires_at": expiry.isoformat()}
