import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional
from app.config import settings
from app.models.schemas import CallLogCreate, CallLogResponse

logger = logging.getLogger(__name__)

# Attempt to configure Supabase client if available
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY and "dummy" not in settings.SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        logger.warning(f"Could not connect to Supabase: {e}")

# In-memory backup store for call records
CALL_LOGS_DB: List[dict] = [
    {
        "id": "call-1001",
        "listing_id": "list-001",
        "caller_role": "NGO",
        "caller_name": "Rajesh Kumar (Akshaya Patra)",
        "caller_phone": "+91 98101 23456",
        "recipient_name": "NSUT Campus Dining Hall",
        "recipient_phone": "+91 98765 43210",
        "duration_seconds": 62,
        "status": "COMPLETED",
        "notes": "Coordinated pickup time for 180 servings of Dal Makhani at NSUT gate #3.",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "call-1002",
        "listing_id": "list-002",
        "caller_role": "RESTAURANT",
        "caller_name": "Taj Palace Kitchen Manager",
        "caller_phone": "+91 98999 11223",
        "recipient_name": "Robin Hood Army Dispatcher",
        "recipient_phone": "+91 98234 56789",
        "duration_seconds": 45,
        "status": "COMPLETED",
        "notes": "Confirmed vehicle dispatch for 350 meals.",
        "created_at": datetime.now(timezone.utc)
    }
]

class CallService:
    """
    Ola-style Contact & Call Data Tracking Service.
    Records call attempts, volunteer contacts, and donor communications into Supabase PostgreSQL.
    """

    @classmethod
    def log_call(cls, data: CallLogCreate) -> CallLogResponse:
        call_id = f"call-{uuid.uuid4().hex[:8]}"
        created_at = datetime.now(timezone.utc)

        record = {
            "id": call_id,
            "listing_id": data.listing_id,
            "caller_role": data.caller_role,
            "caller_name": data.caller_name,
            "caller_phone": data.caller_phone,
            "recipient_name": data.recipient_name,
            "recipient_phone": data.recipient_phone,
            "duration_seconds": data.duration_seconds or 45,
            "status": data.status,
            "notes": data.notes or "Coordinates food pickup details and location ETA.",
            "created_at": created_at
        }

        # Save to local store
        CALL_LOGS_DB.insert(0, record)

        # Attempt saving to Supabase if connected
        if supabase_client:
            try:
                supabase_client.table("call_logs").insert({
                    "id": call_id,
                    "listing_id": data.listing_id,
                    "caller_role": data.caller_role,
                    "caller_phone": data.caller_phone,
                    "recipient_phone": data.recipient_phone,
                    "caller_name": data.caller_name,
                    "recipient_name": data.recipient_name,
                    "duration_seconds": data.duration_seconds or 45,
                    "status": data.status,
                    "notes": data.notes
                }).execute()
            except Exception as e:
                logger.warning(f"Supabase call log insert failed: {e}")

        return CallLogResponse(**record)

    @classmethod
    def get_call_history(cls, listing_id: Optional[str] = None) -> List[CallLogResponse]:
        if listing_id:
            filtered = [c for c in CALL_LOGS_DB if c.get("listing_id") == listing_id]
            return [CallLogResponse(**c) for c in filtered]
        return [CallLogResponse(**c) for c in CALL_LOGS_DB]
