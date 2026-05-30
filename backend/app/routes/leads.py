"""Lead listing, filtering, and CSV export."""

from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.services.supabase_client import get_supabase
from app.utils.security import CurrentUser

router = APIRouter()


@router.get("")
async def list_leads(
    user_id: CurrentUser,
    q: str | None = Query(default=None, description="Search across username, name, email"),
    keyword: str | None = None,
    limit: int = 100,
    offset: int = 0,
):
    sb = get_supabase()
    query = sb.table("leads").select("*", count="exact").eq("user_id", user_id)
    if keyword:
        query = query.eq("keyword", keyword)
    if q:
        # ilike on multiple columns
        query = query.or_(f"username.ilike.%{q}%,name.ilike.%{q}%,email.ilike.%{q}%")
    res = (
        query.order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"data": res.data, "total": res.count}


@router.post("/export")
async def export_csv(user_id: CurrentUser):
    sb = get_supabase()
    res = sb.table("leads").select("*").eq("user_id", user_id).execute()

    buf = io.StringIO()
    writer = csv.DictWriter(
        buf,
        fieldnames=[
            "id",
            "username",
            "name",
            "email",
            "phone",
            "source_post_id",
            "keyword",
            "tags",
            "notes",
            "created_at",
        ],
        extrasaction="ignore",
    )
    writer.writeheader()
    for row in res.data:
        row["tags"] = "|".join(row.get("tags") or [])
        writer.writerow(row)

    buf.seek(0)
    return StreamingResponse(
        iter([buf.read()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="leads.csv"'},
    )
