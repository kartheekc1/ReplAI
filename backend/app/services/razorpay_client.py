"""Razorpay order creation, signature verification, and subscription plan helpers.

Pricing is in **Indian Rupees** (INR), amounts stored in paise.
"""

from __future__ import annotations

from typing import Any

import razorpay

from app.config import get_settings

settings = get_settings()
_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)) \
    if settings.RAZORPAY_KEY_ID else None


# All prices in paise (₹1 = 100 paise). Monthly billing.
PRICING_INR = {
    "free":    0,          # ₹0
    "starter": 34_900,     # ₹349
    "pro":     49_900,     # ₹499
    "agency": 129_900,     # ₹1,299
}

# Yearly discount tier — 10% off, billed annually (₹349 → ₹314/mo equivalent, etc.)
YEARLY_INR = {
    "free":    0,
    "starter": 376_900,    # ₹3,769 / yr  (~₹314/mo, 349 × 12 × 0.9)
    "pro":     538_900,    # ₹5,389 / yr  (~₹449/mo, 499 × 12 × 0.9)
    "agency": 1_402_900,   # ₹14,029 / yr (~₹1,169/mo, 1299 × 12 × 0.9)
}


def create_order(plan: str, currency: str = "INR", billing: str = "monthly") -> dict[str, Any]:
    """Create a Razorpay order for a one-time / monthly plan upgrade."""
    if _client is None:
        raise RuntimeError("Razorpay not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET")

    table = YEARLY_INR if billing == "yearly" else PRICING_INR
    amount = table.get(plan)
    if amount is None:
        raise ValueError(f"Unknown plan: {plan}")
    if amount == 0:
        raise ValueError("Free plan does not require payment")

    order = _client.order.create(
        {
            "amount": amount,
            "currency": currency,
            "payment_capture": 1,
            "notes": {"plan": plan, "billing": billing},
        }
    )
    return {
        "id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan": plan,
        "billing": billing,
    }


def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if _client is None:
        return False
    try:
        _client.utility.verify_payment_signature(
            {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            }
        )
        return True
    except razorpay.errors.SignatureVerificationError:
        return False


# ---------- Subscription plans (run once at setup) ----------

def ensure_plans() -> dict[str, str]:
    """Idempotently create Razorpay Subscription plans for each tier.

    Returns a mapping of `plan_tier -> razorpay_plan_id`. Persist these in env
    or in the `subscriptions.razorpay_plan_id` column for later subscription creation.
    """
    if _client is None:
        raise RuntimeError("Razorpay not configured")

    out: dict[str, str] = {}
    for tier, amount in PRICING_INR.items():
        if amount == 0:
            continue
        plan = _client.plan.create(
            {
                "period": "monthly",
                "interval": 1,
                "item": {
                    "name": f"ReplAI {tier.title()}",
                    "amount": amount,
                    "currency": "INR",
                    "description": f"ReplAI {tier.title()} plan — monthly",
                },
                "notes": {"tier": tier, "source": "ensure_plans"},
            }
        )
        out[tier] = plan["id"]
    return out
