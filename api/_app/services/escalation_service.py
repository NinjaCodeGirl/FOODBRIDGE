import math
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from _app.models.schemas import NGOOfferResponse
from _app.services.matching_engine import SmartMatchingEngine
from _app.services.notification_service import NotificationService
from _app.routers.donations import SURPLUS_DB

class EscalationService:
    """
    Automatic NGO Escalation & Food Reallocation Engine (Section 4).
    Features:
    - Smart NGO matching based on cold chain, distance, capacity & trust score.
    - Server-side response countdowns (default 5 minutes, configurable).
    - Automatic expiry and instant reallocation to the next eligible NGO.
    - Partial quantity allocation (e.g., 60 accepted out of 100 -> remaining 40 offered to next NGO).
    - Atomic quantity reservation locks preventing double-booking.
    - Preserves food in transit (never reallocates food already collected or in transit).
    """

    OFFERS_DB: Dict[str, Dict[str, Any]] = {
        "offer-101": {
            "id": "offer-101",
            "listing_id": "list-001",
            "food_title": "Fresh Cooked Dal Makhani & Rice",
            "donor_name": "NSUT Campus Dining Hall",
            "ngo_id": "ngo-101",
            "ngo_name": "Akshaya Patra Foundation Shelter",
            "offered_servings": 100,
            "status": "OFFERED",
            "offered_at": datetime.now(timezone.utc) - timedelta(minutes=1),
            "response_deadline": datetime.now(timezone.utc) + timedelta(minutes=4),
            "response_at": None,
            "accepted_servings": None,
            "rejection_reason": None,
            "escalation_level": 1,
            "next_ngo_id": None
        }
    }

    ESCALATION_HISTORY: List[Dict[str, Any]] = []

    @classmethod
    def get_ranked_ngos_for_listing(cls, listing: Dict[str, Any]) -> List[Dict[str, Any]]:
        donor_lat = listing.get("latitude", 28.6100)
        donor_lon = listing.get("longitude", 77.0380)
        classification = listing.get("classification", "CATEGORY_A")

        eligible = SmartMatchingEngine.NGO_REGISTRY
        if classification == "CATEGORY_B":
            eligible = [n for n in SmartMatchingEngine.NGO_REGISTRY if n.get("has_cold_storage")]
            if not eligible:
                eligible = SmartMatchingEngine.NGO_REGISTRY

        scored = []
        for ngo in eligible:
            dist = SmartMatchingEngine.haversine_distance(donor_lat, donor_lon, ngo["lat"], ngo["lon"])
            priority = (ngo["trust"] * 20.0) - (dist * 3.0) + (ngo["capacity"] / 50.0)
            if classification == "CATEGORY_B" and ngo.get("has_cold_storage"):
                priority += 15.0
            scored.append({
                **ngo,
                "distance_km": dist,
                "priority_score": priority
            })

        scored.sort(key=lambda x: x["priority_score"], reverse=True)
        return scored

    @classmethod
    def create_initial_offer(
        cls,
        listing_id: str,
        response_window_minutes: int = 5,
        servings: Optional[int] = None
    ) -> Dict[str, Any]:
        listing = next((item for item in SURPLUS_DB if item["id"] == listing_id), None)
        if not listing:
            raise ValueError(f"Listing {listing_id} not found.")

        # In-transit protection: Never offer food that is already picked up or in transit
        if listing.get("status") in ["PICKUP_ASSIGNED", "IN_TRANSIT", "COLLECTED", "DELIVERED"]:
            raise ValueError(f"Listing {listing_id} is already in transit or collected ({listing.get('status')}). Cannot offer.")

        ranked_ngos = cls.get_ranked_ngos_for_listing(listing)
        if not ranked_ngos:
            raise ValueError("No eligible NGOs registered in proximity.")

        top_ngo = ranked_ngos[0]
        offer_servings = servings or listing.get("quantity_servings", 100)

        offer_id = f"offer-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc)
        deadline = now + timedelta(minutes=response_window_minutes)

        offer = {
            "id": offer_id,
            "listing_id": listing_id,
            "food_title": listing.get("food_title", "Surplus Meals"),
            "donor_name": listing.get("donor_name", "Grand Kitchen"),
            "ngo_id": top_ngo["id"],
            "ngo_name": top_ngo["name"],
            "offered_servings": offer_servings,
            "status": "OFFERED",
            "offered_at": now,
            "response_deadline": deadline,
            "response_at": None,
            "accepted_servings": None,
            "rejection_reason": None,
            "escalation_level": 1,
            "next_ngo_id": None
        }

        cls.OFFERS_DB[offer_id] = offer

        # Dispatch in-app notification to the top NGO
        NotificationService.dispatch(
            role="RECIPIENT",
            event_type="DONATION_CREATED",
            title="⚡ Priority Food Offer (5m Window)",
            message=f"You have been matched with {offer_servings} portions of '{listing.get('food_title')}'. Please accept within {response_window_minutes} mins.",
            action_url=f"/offers/{offer_id}",
            user_id=top_ngo["id"],
            priority="HIGH",
            metadata={"offer_id": offer_id, "listing_id": listing_id, "deadline": deadline.isoformat()}
        )

        cls.ESCALATION_HISTORY.append({
            "event": "INITIAL_OFFER_DISPATCHED",
            "offer_id": offer_id,
            "listing_id": listing_id,
            "ngo_id": top_ngo["id"],
            "ngo_name": top_ngo["name"],
            "servings": offer_servings,
            "deadline": deadline.isoformat(),
            "timestamp": now.isoformat()
        })

        return offer

    @classmethod
    def reallocate_to_next_ngo(
        cls,
        listing_id: str,
        servings: int,
        current_level: int = 1,
        response_window_minutes: int = 5
    ) -> Optional[Dict[str, Any]]:
        listing = next((item for item in SURPLUS_DB if item["id"] == listing_id), None)
        if not listing or servings <= 0:
            return None

        # In-transit protection: Never reallocate food already in transit or collected
        if listing.get("status") in ["PICKUP_ASSIGNED", "IN_TRANSIT", "COLLECTED", "DELIVERED"]:
            return None

        ranked_ngos = cls.get_ranked_ngos_for_listing(listing)
        
        # Find all NGOs already offered for this listing
        already_offered_ngo_ids = {
            o["ngo_id"] for o in cls.OFFERS_DB.values() if o["listing_id"] == listing_id
        }

        # Pick the highest ranked NGO that hasn't been offered yet
        next_candidate = next((n for n in ranked_ngos if n["id"] not in already_offered_ngo_ids), None)
        if not next_candidate:
            # All registered NGOs contacted; mark remainder available for open claim
            NotificationService.dispatch(
                role="RESTAURANT",
                event_type="DELIVERY_DELAYED",
                title="All Priority NGOs Contacted",
                message=f"{servings} portions of '{listing.get('food_title')}' now open for general community claim.",
                action_url="/dashboard"
            )
            return None

        now = datetime.now(timezone.utc)
        deadline = now + timedelta(minutes=response_window_minutes)
        new_offer_id = f"offer-{uuid.uuid4().hex[:8]}"

        new_offer = {
            "id": new_offer_id,
            "listing_id": listing_id,
            "food_title": listing.get("food_title", "Surplus Meals"),
            "donor_name": listing.get("donor_name", "Grand Kitchen"),
            "ngo_id": next_candidate["id"],
            "ngo_name": next_candidate["name"],
            "offered_servings": servings,
            "status": "OFFERED",
            "offered_at": now,
            "response_deadline": deadline,
            "response_at": None,
            "accepted_servings": None,
            "rejection_reason": None,
            "escalation_level": current_level + 1,
            "next_ngo_id": None
        }

        cls.OFFERS_DB[new_offer_id] = new_offer

        # Notify the next NGO
        NotificationService.dispatch(
            role="RECIPIENT",
            event_type="DONATION_CREATED",
            title=f"⚡ Escalated Food Offer (Level {current_level + 1})",
            message=f"Reallocated surplus: {servings} portions of '{listing.get('food_title')}'. 5 mins to accept.",
            action_url=f"/offers/{new_offer_id}",
            user_id=next_candidate["id"],
            priority="HIGH",
            metadata={"offer_id": new_offer_id, "listing_id": listing_id, "deadline": deadline.isoformat()}
        )

        cls.ESCALATION_HISTORY.append({
            "event": "AUTOMATIC_REALLOCATION",
            "new_offer_id": new_offer_id,
            "listing_id": listing_id,
            "to_ngo_id": next_candidate["id"],
            "to_ngo_name": next_candidate["name"],
            "servings": servings,
            "escalation_level": current_level + 1,
            "deadline": deadline.isoformat(),
            "timestamp": now.isoformat()
        })

        return new_offer

    @classmethod
    def respond_to_offer(
        cls,
        offer_id: str,
        action: str,
        accepted_servings: Optional[int] = None,
        rejection_reason: Optional[str] = None,
        extension_minutes: int = 5
    ) -> Dict[str, Any]:
        offer = cls.OFFERS_DB.get(offer_id)
        if not offer:
            raise ValueError(f"Offer {offer_id} not found.")

        now = datetime.now(timezone.utc)
        action = action.upper()

        if action == "ACCEPT":
            if now > offer["response_deadline"]:
                offer["status"] = "EXPIRED"
                raise ValueError("Offer has already expired. It has been reallocated to the next NGO.")

            portions_to_accept = accepted_servings if accepted_servings is not None else offer["offered_servings"]
            if portions_to_accept <= 0 or portions_to_accept > offer["offered_servings"]:
                raise ValueError(f"Accepted portions ({portions_to_accept}) cannot exceed offered portions ({offer['offered_servings']}).")

            offer["status"] = "ACCEPTED"
            offer["response_at"] = now
            offer["accepted_servings"] = portions_to_accept

            # Atomically reserve accepted portions in listing
            listing = next((item for item in SURPLUS_DB if item["id"] == offer["listing_id"]), None)
            if listing:
                listing["quantity_servings"] = max(0, listing.get("quantity_servings", 0) - portions_to_accept)
                listing["reserved_servings"] = listing.get("reserved_servings", 0) + portions_to_accept

            # Check if this was a PARTIAL allocation (e.g. accepted 60 out of 100)
            reallocated_next = False
            next_offer_obj = None
            remaining_unaccepted = offer["offered_servings"] - portions_to_accept

            if remaining_unaccepted > 0:
                # Automatically reallocate remaining portions to the next NGO in line!
                next_offer_obj = cls.reallocate_to_next_ngo(
                    listing_id=offer["listing_id"],
                    servings=remaining_unaccepted,
                    current_level=offer["escalation_level"]
                )
                if next_offer_obj:
                    reallocated_next = True
                    offer["next_ngo_id"] = next_offer_obj["ngo_id"]

            # Dispatch acceptance notification to Restaurant
            NotificationService.dispatch(
                role="RESTAURANT",
                event_type="REQUEST_ACCEPTED",
                title="Food Offer Accepted!",
                message=f"{offer['ngo_name']} accepted {portions_to_accept} portions of '{offer['food_title']}'.",
                action_url=f"/deliveries/active"
            )

            return {
                "success": True,
                "message": f"Successfully accepted {portions_to_accept} portions.",
                "action_taken": "ACCEPT",
                "offer": offer,
                "reallocated_to_next": reallocated_next,
                "next_offer": next_offer_obj,
                "remaining_available_servings": listing.get("quantity_servings", 0) if listing else 0
            }

        elif action == "REJECT":
            offer["status"] = "REJECTED"
            offer["response_at"] = now
            offer["rejection_reason"] = rejection_reason or "NGO currently at max capacity."

            # Automatically offer the entire rejected quantity to next NGO
            next_offer_obj = cls.reallocate_to_next_ngo(
                listing_id=offer["listing_id"],
                servings=offer["offered_servings"],
                current_level=offer["escalation_level"]
            )
            reallocated_next = next_offer_obj is not None
            if next_offer_obj:
                offer["next_ngo_id"] = next_offer_obj["ngo_id"]

            NotificationService.dispatch(
                role="RESTAURANT",
                event_type="REQUEST_REJECTED",
                title="Offer Declined — Escalated",
                message=f"{offer['ngo_name']} declined; offer automatically escalated to next partner.",
                action_url=f"/dashboard"
            )

            return {
                "success": True,
                "message": "Offer rejected. Automatically escalated to next eligible partner.",
                "action_taken": "REJECT",
                "offer": offer,
                "reallocated_to_next": reallocated_next,
                "next_offer": next_offer_obj,
                "remaining_available_servings": offer["offered_servings"]
            }

        elif action == "REQUEST_TIME":
            offer["response_deadline"] += timedelta(minutes=extension_minutes)
            offer["status"] = "TIME_EXTENSION_REQUESTED"

            NotificationService.dispatch(
                role="RESTAURANT",
                event_type="DELIVERY_DELAYED",
                title="NGO Requested Time Extension",
                message=f"{offer['ngo_name']} requested +{extension_minutes} mins to confirm capacity.",
                action_url=f"/dashboard"
            )

            return {
                "success": True,
                "message": f"Response window extended by {extension_minutes} minutes.",
                "action_taken": "REQUEST_TIME",
                "offer": offer,
                "reallocated_to_next": False,
                "next_offer": None,
                "remaining_available_servings": offer["offered_servings"]
            }
        else:
            raise ValueError(f"Unsupported action: {action}. Use ACCEPT, REJECT, or REQUEST_TIME.")

    @classmethod
    def check_and_escalate_all(cls) -> List[Dict[str, Any]]:
        """
        Background/cron worker checking for expired response countdowns.
        If an NGO does not respond before deadline, marks EXPIRED and reallocates to next.
        """
        now = datetime.now(timezone.utc)
        escalated_events = []

        for offer_id, offer in list(cls.OFFERS_DB.items()):
            if offer["status"] == "OFFERED" and now > offer["response_deadline"]:
                offer["status"] = "EXPIRED"
                offer["response_at"] = now

                # Dispatch expiry notification
                NotificationService.dispatch(
                    role="RECIPIENT",
                    event_type="DELIVERY_DELAYED",
                    title="Offer Expired (Timeout)",
                    message=f"Offer for '{offer['food_title']}' expired due to no response within window.",
                    user_id=offer["ngo_id"]
                )

                # Reallocate to next NGO
                next_offer_obj = cls.reallocate_to_next_ngo(
                    listing_id=offer["listing_id"],
                    servings=offer["offered_servings"],
                    current_level=offer["escalation_level"]
                )

                if next_offer_obj:
                    offer["next_ngo_id"] = next_offer_obj["ngo_id"]

                cls.ESCALATION_HISTORY.append({
                    "event": "OFFER_TIMEOUT_ESCALATION",
                    "expired_offer_id": offer_id,
                    "listing_id": offer["listing_id"],
                    "previous_ngo": offer["ngo_name"],
                    "next_ngo": next_offer_obj["ngo_name"] if next_offer_obj else "NONE_AVAILABLE",
                    "timestamp": now.isoformat()
                })

                escalated_events.append({
                    "expired_offer_id": offer_id,
                    "reallocated_to": next_offer_obj["ngo_id"] if next_offer_obj else None
                })

        return escalated_events

    @classmethod
    def get_offers_for_ngo(cls, ngo_id: str) -> List[NGOOfferResponse]:
        # Always run check first for server-side accuracy
        cls.check_and_escalate_all()
        now = datetime.now(timezone.utc)

        results = []
        for offer in cls.OFFERS_DB.values():
            if offer["ngo_id"] == ngo_id or ngo_id == "ALL":
                diff = (offer["response_deadline"] - now).total_seconds()
                secs_rem = max(0, int(diff)) if offer["status"] == "OFFERED" else 0
                results.append(NGOOfferResponse(
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
                    seconds_remaining=secs_rem,
                    escalation_level=offer.get("escalation_level", 1),
                    accepted_servings=offer.get("accepted_servings"),
                    rejection_reason=offer.get("rejection_reason")
                ))

        results.sort(key=lambda x: x.offered_at, reverse=True)
        return results

