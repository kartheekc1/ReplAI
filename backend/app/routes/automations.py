"""CRUD for automations."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import AutomationIn, AutomationOut
from app.services.supabase_client import get_supabase
from app.utils.security import CurrentUser

router = APIRouter()


@router.get("", response_model=list[AutomationOut])
async def list_automations(user_id: CurrentUser):
    sb = get_supabase()
    res = (
        sb.table("automations")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.post("", response_model=AutomationOut, status_code=status.HTTP_201_CREATED)
async def create_automation(body: AutomationIn, user_id: CurrentUser):
    sb = get_supabase()
    res = (
        sb.table("automations")
        .insert({**body.model_dump(), "user_id": user_id})
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not create automation")
    return res.data[0]


@router.put("/{automation_id}", response_model=AutomationOut)
async def update_automation(automation_id: str, body: AutomationIn, user_id: CurrentUser):
    sb = get_supabase()
    res = (
        sb.table("automations")
        .update(body.model_dump())
        .eq("id", automation_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Automation not found")
    return res.data[0]


@router.delete("/{automation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_automation(automation_id: str, user_id: CurrentUser):
    sb = get_supabase()
    sb.table("automations").delete().eq("id", automation_id).eq("user_id", user_id).execute()
    return None


@router.post("/{automation_id}/pause", response_model=AutomationOut)
async def pause(automation_id: str, user_id: CurrentUser):
    sb = get_supabase()
    res = (
        sb.table("automations")
        .update({"status": "paused"})
        .eq("id", automation_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data[0]


@router.post("/{automation_id}/resume", response_model=AutomationOut)
async def resume(automation_id: str, user_id: CurrentUser):
    sb = get_supabase()
    res = (
        sb.table("automations")
        .update({"status": "active"})
        .eq("id", automation_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data[0]
