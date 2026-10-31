from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import CallLogCreate, CallLogResponse
from app.services.call_service import CallService

router = APIRouter(prefix="/api/calls", tags=["Ola-style Contact & Call Logging"])

@router.post("/log", response_model=CallLogResponse)
def log_phone_call(data: CallLogCreate):
    """
    Log a phone call between donor and NGO volunteer (Ola-style contact transparency).
    """
    return CallService.log_call(data)

@router.get("/history", response_model=List[CallLogResponse])
def get_call_history(listing_id: Optional[str] = Query(None, description="Optional listing ID filter")):
    """
    Fetch historical call logs for auditing.
    """
    return CallService.get_call_history(listing_id)
