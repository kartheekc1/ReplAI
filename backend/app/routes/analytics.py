"""Aggregated analytics for the dashboard."""

from __future__ import annotations

from collections import Counter

from fastapi import APIRouter

from app.services.supabase_client import get_supabase
from app.utils.security import CurrentUser

router = APIRouter()


@router.get("")
async def overview(user_id: CurrentUser):
    sb = get_supabase()

    comments = (
        sb.table("comments")
        .select("id, matched_keyword, created_at, automation_id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    dms = (
        sb.table("messages")
        .select("id, status, sent_at", count="exact")
        .eq("user_id", user_id)
        .eq("status", "sent")
        .execute()
    )
    leads = (
        sb.table("leads")
        .select("id, keyword, source_post_id, created_at", count="exact")
        .eq("user_id", user_id)
        .execute()
    )

    cc = comments.count or 0
    dc = dms.count or 0
    lc = leads.count or 0
    conv = (lc / cc * 100) if cc else 0.0

    # Top keywords + posts
    top_keywords = [
        {"label": k, "value": v}
        for k, v in Counter(
            r["keyword"] for r in (leads.data or []) if r.get("keyword")
        ).most_common(6)
    ]
    top_posts = [
        {"name": p, "leads": v}
        for p, v in Counter(
            r["source_post_id"] for r in (leads.data or []) if r.get("source_post_id")
        ).most_common(5)
    ]

    return {
        "comments_count": cc,
        "dms_count": dc,
        "leads_count": lc,
        "conversion_rate": round(conv, 2),
        "revenue": 0,  # plug in when subscription/order events land
        "top_keywords": top_keywords,
        "top_posts": top_posts,
    }
