"""Pydantic schemas shared across routes."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

PlanTier = Literal["free", "starter", "pro", "agency"]
AutomationStatus = Literal["active", "paused", "draft"]
AutomationTriggerType = Literal["comment", "story_reply", "dm"]


# ---------- Auth ----------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthIn(BaseModel):
    id_token: str


class AuthOut(BaseModel):
    user_id: str
    email: str
    access_token: str | None = None


# ---------- Automations ----------

class AutomationIn(BaseModel):
    account_id: str
    name: str
    trigger_type: AutomationTriggerType = "comment"
    post_id: str | None = None
    keywords: list[str] = Field(min_length=1)
    message: str = Field(min_length=1)
    cta_label: str | None = None
    cta_url: str | None = None
    require_follow: bool = False
    reply_publicly: bool = True
    status: AutomationStatus = "active"


class AutomationOut(AutomationIn):
    id: str
    user_id: str
    dms_sent: int = 0
    leads_captured: int = 0
    created_at: datetime
    updated_at: datetime


# ---------- Leads ----------

class LeadIn(BaseModel):
    automation_id: str | None = None
    username: str
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    source_post_id: str | None = None
    keyword: str | None = None
    notes: str | None = None
    tags: list[str] = []


class LeadOut(LeadIn):
    id: str
    user_id: str
    created_at: datetime


# ---------- Instagram ----------

class IGAccountOut(BaseModel):
    id: str
    user_id: str
    ig_user_id: str
    username: str
    followers: int
    profile_picture_url: str | None
    status: Literal["connected", "expired", "revoked"]
    connected_at: datetime


class IGCallbackIn(BaseModel):
    code: str


# ---------- Billing ----------

class CreateOrderIn(BaseModel):
    plan: PlanTier
    currency: str = "USD"


class CreateOrderOut(BaseModel):
    id: str
    amount: int
    currency: str
    key_id: str


class VerifyPaymentIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ---------- Analytics ----------

class AnalyticsOut(BaseModel):
    comments_count: int
    dms_count: int
    leads_count: int
    conversion_rate: float
    revenue: float
    daily_dms: list[dict]
    daily_leads: list[dict]
    top_keywords: list[dict]
    top_posts: list[dict]
