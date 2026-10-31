import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.models.schemas import NotificationItem

class NotificationService:
    """
    Central In-App & Operational Notification Service (Phase 7).
    Dispatches and tracks lifecycle alerts across all 4 user roles:
    - DONATION_CREATED
    - FOOD_REQUEST_RECEIVED
    - REQUEST_ACCEPTED
    - REQUEST_REJECTED
    - VOLUNTEER_ASSIGNED
    - VOLUNTEER_APPROACHING
    - PICKUP_COMPLETED
    - DELIVERY_DELAYED
    - FOOD_DELIVERED
    - DISTRIBUTION_COMPLETED
    """

    NOTIFICATIONS_STORE: List[Dict[str, Any]] = [
        {
            "id": "notif-001",
            "user_id": None,
            "role": "RESTAURANT",
            "event_type": "FOOD_REQUEST_RECEIVED",
            "title": "New Surplus Request",
            "message": "Akshaya Patra Foundation requested 60 portions of Cooked Meals.",
            "action_url": "/dashboard",
            "priority": "HIGH",
            "is_read": False,
            "timestamp": datetime.now(timezone.utc),
            "metadata": {"donation_id": "list-002"}
        },
        {
            "id": "notif-002",
            "user_id": None,
            "role": "VOLUNTEER",
            "event_type": "VOLUNTEER_ASSIGNED",
            "title": "New Rescue Assignment",
            "message": "Pickup allocated at Taj Palace Banquet Kitchen (150 meals).",
            "action_url": "/volunteer",
            "priority": "NORMAL",
            "is_read": False,
            "timestamp": datetime.now(timezone.utc),
            "metadata": {"delivery_id": "deliv-401"}
        }
    ]

    @classmethod
    def dispatch(
        cls,
        role: str,
        event_type: str,
        title: str,
        message: str,
        action_url: Optional[str] = None,
        user_id: Optional[str] = None,
        priority: str = "NORMAL",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        item = {
            "id": f"notif-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "role": role,
            "event_type": event_type,
            "title": title,
            "message": message,
            "action_url": action_url,
            "priority": priority,
            "is_read": False,
            "timestamp": datetime.now(timezone.utc),
            "metadata": metadata or {}
        }
        cls.NOTIFICATIONS_STORE.insert(0, item)
        return item

    @classmethod
    def get_notifications(cls, role: Optional[str] = None, user_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        results = cls.NOTIFICATIONS_STORE
        if role:
            results = [n for n in results if n.get("role") == role or n.get("role") == "ALL"]
        if user_id:
            results = [n for n in results if n.get("user_id") in [None, user_id]]
        return results[:limit]

    @classmethod
    def get_unread_count(cls, role: Optional[str] = None, user_id: Optional[str] = None) -> int:
        notifs = cls.get_notifications(role, user_id, limit=100)
        return len([n for n in notifs if not n.get("is_read")])

    @classmethod
    def mark_as_read(cls, notif_id: str) -> bool:
        for n in cls.NOTIFICATIONS_STORE:
            if n["id"] == notif_id:
                n["is_read"] = True
                return True
        return False

    @classmethod
    def mark_all_read(cls, role: Optional[str] = None, user_id: Optional[str] = None) -> int:
        count = 0
        for n in cls.NOTIFICATIONS_STORE:
            if (not role or n.get("role") == role) and (not user_id or n.get("user_id") in [None, user_id]):
                if not n.get("is_read"):
                    n["is_read"] = True
                    count += 1
        return count
