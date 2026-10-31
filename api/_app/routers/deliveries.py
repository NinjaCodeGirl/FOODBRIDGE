from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from _app.models.schemas import (
    DeliveryRequestCreate,
    DeliveryApproveRequest,
    DeliveryAssignRequest,
    DeliveryLocationPing,
    DeliveryDelayReport,
    DeliveryArrivalVerify,
    DeliveryRecordResponse,
    LivePickupStatusResponse
)
from _app.services.delivery_service import DeliveryService
from _app.services.notification_service import NotificationService
from _app.routers.donations import SURPLUS_DB

router = APIRouter(prefix="/api/deliveries", tags=["Rapid Pickup & Delivery Tracking (Phase 5)"])

@router.post("/request", response_model=DeliveryRecordResponse)
def request_food_pickup(payload: DeliveryRequestCreate):
    """
    Step 1: NGO requests available food listing.
    Atomically checks surplus availability and creates a delivery record.
    """
    listing = next((item for item in SURPLUS_DB if item["id"] == payload.listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Surplus food listing not found.")
    
    if listing.get("status") == "REJECTED":
        raise HTTPException(status_code=400, detail="Cannot request food that has failed safety eligibility checks.")

    available = listing.get("quantity_servings", 0)
    if payload.requested_servings > available:
        raise HTTPException(
            status_code=400,
            detail=f"Requested servings ({payload.requested_servings}) exceed available stock ({available})."
        )

    # Atomically reserve servings
    listing["quantity_servings"] -= payload.requested_servings
    listing["reserved_servings"] = listing.get("reserved_servings", 0) + payload.requested_servings

    record = DeliveryService.create_delivery_request(
        listing_id=listing["id"],
        ngo_id=payload.ngo_id,
        ngo_name=payload.ngo_name,
        requested_servings=payload.requested_servings,
        dropoff_address=payload.dropoff_address,
        dropoff_lat=payload.dropoff_lat,
        dropoff_lon=payload.dropoff_lon,
        donor_name=listing.get("donor_name", "Grand Kitchen"),
        food_title=listing.get("food_title", "Surplus Meals"),
        pickup_address=listing.get("pickup_address", "NSUT Campus"),
        pickup_lat=listing.get("latitude", 28.6100),
        pickup_lon=listing.get("longitude", 77.0380)
    )

    # Dispatch notification to Restaurant
    NotificationService.dispatch(
        role="RESTAURANT",
        event_type="FOOD_REQUEST_RECEIVED",
        title="New Surplus Request",
        message=f"{payload.ngo_name} requested {payload.requested_servings} portions of '{listing.get('food_title')}'.",
        action_url=f"/deliveries/{record['id']}",
        metadata={"delivery_id": record["id"], "requested_servings": payload.requested_servings}
    )

    return record

@router.post("/approve", response_model=DeliveryRecordResponse)
def approve_delivery_request(payload: DeliveryApproveRequest):
    """
    Step 2: Restaurant approves the NGO's food request and sets kitchen prep time.
    """
    try:
        updated = DeliveryService.approve_request(
            delivery_id=payload.delivery_id,
            prep_time_minutes=payload.prep_time_minutes,
            pickup_instructions=payload.pickup_instructions
        )

        # Dispatch notification to NGO
        NotificationService.dispatch(
            role="RECIPIENT",
            event_type="REQUEST_ACCEPTED",
            title="Request Approved!",
            message=f"{updated.get('donor_name')} approved your request for {updated.get('allocated_servings')} portions.",
            action_url=f"/deliveries/{payload.delivery_id}",
            metadata={"delivery_id": payload.delivery_id}
        )

        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/assign", response_model=DeliveryRecordResponse)
def assign_volunteer(payload: DeliveryAssignRequest):
    """
    Step 3: Dispatch volunteer to pickup assignment.
    """
    try:
        updated = DeliveryService.assign_volunteer(
            delivery_id=payload.delivery_id,
            volunteer_id=payload.volunteer_id,
            volunteer_name=payload.volunteer_name,
            volunteer_phone=payload.volunteer_phone,
            vehicle_type=payload.vehicle_type,
            volunteer_lat=payload.volunteer_lat,
            volunteer_lon=payload.volunteer_lon
        )

        # Dispatch notification to Volunteer
        NotificationService.dispatch(
            role="VOLUNTEER",
            event_type="VOLUNTEER_ASSIGNED",
            title="New Pickup Assignment",
            message=f"Pickup assigned at {updated.get('donor_name')} ({updated.get('allocated_servings')} meals).",
            action_url=f"/deliveries/{payload.delivery_id}",
            metadata={"delivery_id": payload.delivery_id}
        )

        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/accept", response_model=DeliveryRecordResponse)
def accept_assignment(delivery_id: str = Query(...), volunteer_id: str = Query("user_arjun_volunteer")):
    """
    Step 4: Volunteer accepts pickup assignment.
    Starts live countdown and calculates server-side pickup deadline.
    """
    try:
        accepted = DeliveryService.accept_assignment(delivery_id, volunteer_id)

        # Dispatch notifications to Donor & NGO
        NotificationService.dispatch(
            role="RESTAURANT",
            event_type="VOLUNTEER_APPROACHING",
            title="Courier En Route",
            message=f"Volunteer {accepted.get('volunteer_name')} accepted pickup. ETA: {accepted.get('estimated_travel_minutes')} mins.",
            action_url=f"/deliveries/{delivery_id}"
        )
        NotificationService.dispatch(
            role="RECIPIENT",
            event_type="VOLUNTEER_APPROACHING",
            title="Pickup In Progress",
            message=f"Volunteer is en route to collect your food from {accepted.get('donor_name')}.",
            action_url=f"/deliveries/{delivery_id}"
        )

        return accepted
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/location-ping")
def update_volunteer_gps(payload: DeliveryLocationPing):
    """
    Step 5: Volunteer client updates live GPS location.
    Recalculates real-time distance and ETA.
    """
    try:
        updated = DeliveryService.update_volunteer_location(
            delivery_id=payload.delivery_id,
            volunteer_id=payload.volunteer_id,
            lat=payload.current_lat,
            lon=payload.current_lon
        )
        return {
            "success": True,
            "delivery_id": payload.delivery_id,
            "estimated_travel_minutes": updated.get("estimated_travel_minutes")
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/arrive")
def verify_arrival(payload: DeliveryArrivalVerify):
    """
    Step 6: Volunteer confirms arrival at restaurant via GPS proximity check (<250m).
    """
    try:
        return DeliveryService.verify_proximity_arrival(
            delivery_id=payload.delivery_id,
            volunteer_id=payload.volunteer_id,
            current_lat=payload.current_lat,
            current_lon=payload.current_lon
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/report-delay")
def report_pickup_delay(payload: DeliveryDelayReport):
    """
    Step 7: Delay Management - Volunteer reports delay with standardized reason.
    Extends server pickup deadline and dispatches delay alerts.
    """
    try:
        res = DeliveryService.report_delay(
            delivery_id=payload.delivery_id,
            volunteer_id=payload.volunteer_id,
            delay_reason=payload.delay_reason,
            delay_minutes=payload.delay_minutes,
            notes=payload.notes
        )

        # Dispatch delay alert to Restaurant and NGO
        NotificationService.dispatch(
            role="RESTAURANT",
            event_type="DELIVERY_DELAYED",
            title="Courier Delay Notice",
            message=f"Courier delayed by {payload.delay_minutes} mins due to {payload.delay_reason}.",
            action_url=f"/deliveries/{payload.delivery_id}"
        )
        NotificationService.dispatch(
            role="RECIPIENT",
            event_type="DELIVERY_DELAYED",
            title="Delivery Delay Notice",
            message=f"Food collection delayed by {payload.delay_minutes} mins.",
            action_url=f"/deliveries/{payload.delivery_id}"
        )

        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{delivery_id}/status", response_model=LivePickupStatusResponse)
def get_live_pickup_status(delivery_id: str):
    """
    Live ETA, distance, seconds remaining countdown, and transparent late policy status.
    """
    try:
        return DeliveryService.get_live_pickup_status(delivery_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/active", response_model=List[DeliveryRecordResponse])
def get_active_deliveries(role: Optional[str] = Query(None)):
    """
    Returns active deliveries, optionally filtered by user role.
    """
    records = list(DeliveryService.DELIVERIES_DB.values())
    if role == "VOLUNTEER":
        return [r for r in records if r.get("status") in ["ASSIGNED", "EN_ROUTE_TO_PICKUP", "ARRIVED_AT_PICKUP"]]
    return records

@router.post("/reassign")
def reassign_volunteer(delivery_id: str = Query(...), reason: str = Query("Volunteer emergency / vehicle issue")):
    """
    Reassign delivery if volunteer is delayed beyond acceptable threshold or cancelled.
    """
    try:
        return DeliveryService.reassign_volunteer(delivery_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

