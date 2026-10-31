from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import NotificationItem, NotificationDispatchCreate
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["In-App Notifications (Phase 7)"])

@router.get("", response_model=List[NotificationItem])
def get_notifications(
    role: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Returns notifications for the authenticated user and role.
    """
    return NotificationService.get_notifications(role=role, user_id=user_id, limit=limit)

@router.get("/unread-count")
def get_unread_count(
    role: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None)
):
    """
    Returns unread notification badge count.
    """
    count = NotificationService.get_unread_count(role=role, user_id=user_id)
    return {"unread_count": count}

@router.post("/mark-read/{notif_id}")
def mark_notification_read(notif_id: str):
    """
    Marks a single notification as read.
    """
    success = NotificationService.mark_as_read(notif_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"success": True, "notification_id": notif_id}

@router.post("/mark-all-read")
def mark_all_notifications_read(
    role: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None)
):
    """
    Marks all notifications as read for current persona.
    """
    count = NotificationService.mark_all_read(role=role, user_id=user_id)
    return {"success": True, "marked_count": count}

@router.post("/dispatch", response_model=NotificationItem)
def dispatch_system_notification(payload: NotificationDispatchCreate):
    """
    Internal event dispatcher for system lifecycle alerts.
    """
    return NotificationService.dispatch(
        role=payload.role,
        event_type=payload.event_type,
        title=payload.title,
        message=payload.message,
        action_url=payload.action_url,
        user_id=payload.user_id,
        metadata=payload.metadata
    )

