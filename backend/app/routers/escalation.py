from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import (
    NGOOfferResponse,
    OfferRespondRequest,
    OfferRespondResponse
)
from app.services.escalation_service import EscalationService

router = APIRouter(prefix="/api/escalation", tags=["Automatic NGO Escalation & Reallocation (Section 4)"])

@router.post("/create-offer", response_model=NGOOfferResponse)
def create_priority_offer(
    listing_id: str = Query(...),
    response_window_minutes: int = Query(5, ge=1, le=60)
):
    """
    Step 1: Restaurant/System dispatches initial food offer to top-ranked eligible NGO with 5m countdown.
    """
    try:
        offer = EscalationService.create_initial_offer(
            listing_id=listing_id,
            response_window_minutes=response_window_minutes
        )
        return NGOOfferResponse(
            id=offer["id"],
            listing_id=offer["listing_id"],
            food_title=offer["food_title"],
            donor_name=offer["donor_name"],
            ngo_id=offer["ngo_id"],
            ngo_name=offer["ngo_name"],
            offered_servings=offer["offered_servings"],
            status=offer["status"],
            offered_at=offer["offered_at"],
            response_deadline=offer["response_deadline"],
            seconds_remaining=response_window_minutes * 60,
            escalation_level=offer["escalation_level"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/respond", response_model=OfferRespondResponse)
def respond_to_food_offer(payload: OfferRespondRequest):
    """
    Step 2: NGO responds:
    - ACCEPT: full or partial acceptance (unaccepted remainder automatically reallocated to next NGO).
    - REJECT: immediately reallocated to next eligible NGO.
    - REQUEST_TIME: extends response countdown by 5-10 minutes.
    """
    try:
        res = EscalationService.respond_to_offer(
            offer_id=payload.offer_id,
            action=payload.action,
            accepted_servings=payload.accepted_servings,
            rejection_reason=payload.rejection_reason,
            extension_minutes=payload.extension_minutes or 5
        )

        offer_dict = res["offer"]
        next_dict = res.get("next_offer")

        offer_resp = NGOOfferResponse(
            id=offer_dict["id"],
            listing_id=offer_dict["listing_id"],
            food_title=offer_dict["food_title"],
            donor_name=offer_dict["donor_name"],
            ngo_id=offer_dict["ngo_id"],
            ngo_name=offer_dict["ngo_name"],
            offered_servings=offer_dict["offered_servings"],
            status=offer_dict["status"],
            offered_at=offer_dict["offered_at"],
            response_deadline=offer_dict["response_deadline"],
            seconds_remaining=0,
            escalation_level=offer_dict.get("escalation_level", 1),
            accepted_servings=offer_dict.get("accepted_servings"),
            rejection_reason=offer_dict.get("rejection_reason")
        )

        next_resp = None
        if next_dict:
            next_resp = NGOOfferResponse(
                id=next_dict["id"],
                listing_id=next_dict["listing_id"],
                food_title=next_dict["food_title"],
                donor_name=next_dict["donor_name"],
                ngo_id=next_dict["ngo_id"],
                ngo_name=next_dict["ngo_name"],
                offered_servings=next_dict["offered_servings"],
                status=next_dict["status"],
                offered_at=next_dict["offered_at"],
                response_deadline=next_dict["response_deadline"],
                seconds_remaining=300,
                escalation_level=next_dict.get("escalation_level", 2)
            )

        return OfferRespondResponse(
            success=res["success"],
            message=res["message"],
            action_taken=res["action_taken"],
            offer=offer_resp,
            reallocated_to_next=res["reallocated_to_next"],
            next_offer=next_resp,
            remaining_available_servings=res["remaining_available_servings"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-offers", response_model=List[NGOOfferResponse])
def get_my_offers(ngo_id: str = Query("ngo-101")):
    """
    Step 3: NGO fetches active offers with live countdown seconds remaining.
    Automatically checks and reallocates timed-out offers server-side.
    """
    return EscalationService.get_offers_for_ngo(ngo_id)

@router.post("/check-escalations")
def trigger_escalation_worker():
    """
    Background worker endpoint: expires unresponded offers and reallocates to next NGO.
    """
    events = EscalationService.check_and_escalate_all()
    return {
        "status": "success",
        "escalated_count": len(events),
        "events": events
    }

@router.get("/history/{listing_id}")
def get_escalation_history(listing_id: str):
    """
    Returns complete audit trail of offers, timeouts, and reallocations for a listing.
    """
    history = [h for h in EscalationService.ESCALATION_HISTORY if h.get("listing_id") == listing_id]
    return {
        "listing_id": listing_id,
        "history": history
    }

