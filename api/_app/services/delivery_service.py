import math
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from _app.models.schemas import (
    DeliveryRecordResponse,
    LivePickupStatusResponse
)
from _app.services.matching_engine import SmartMatchingEngine

class DeliveryService:
    """
    Rapid Pickup, Live GPS, Countdown and Delay Management Engine (Phase 5).
    Provides realistic route ETA calculation, timezone-aware server deadlines,
    transparent late policy enforcement, and GPS proximity verification.
    """

    # In-memory deliveries database
    DELIVERIES_DB: Dict[str, Dict[str, Any]] = {
        "deliv-401": {
            "id": "deliv-401",
            "listing_id": "list-002",
            "ngo_id": "ngo-102",
            "ngo_name": "Robin Hood Army - Janakpuri Center",
            "donor_name": "Taj Palace Banquet Kitchen",
            "food_title": "Assorted Paneer Gravy & Rotis",
            "allocated_servings": 150,
            "pickup_address": "Sardar Patel Marg, Diplomatic Enclave, New Delhi",
            "pickup_lat": 28.5975,
            "pickup_lon": 77.1724,
            "dropoff_address": "Janakpuri Block B, New Delhi",
            "dropoff_lat": 28.6219,
            "dropoff_lon": 77.0878,
            "volunteer_id": "user_arjun_volunteer",
            "volunteer_name": "Arjun Sharma",
            "volunteer_phone": "+91 98222 33445",
            "volunteer_lat": 28.6050,
            "volunteer_lon": 77.1600,
            "status": "EN_ROUTE_TO_PICKUP",
            "prep_time_minutes": 15,
            "estimated_travel_minutes": 18,
            "grace_period_minutes": 10,
            "pickup_deadline": datetime.now(timezone.utc) + timedelta(minutes=25),
            "accepted_at": datetime.now(timezone.utc) - timedelta(minutes=8),
            "collected_at": None,
            "delivered_at": None,
            "late_policy_status": "ON_TIME",
            "delay_history": [],
            "created_at": datetime.now(timezone.utc) - timedelta(minutes=15)
        }
    }

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates straight-line spherical distance in km."""
        return SmartMatchingEngine.haversine_distance(lat1, lon1, lat2, lon2)

    @classmethod
    def calculate_realistic_travel_mins(cls, dist_km: float) -> int:
        """
        Calculates realistic urban travel time based on 25 km/h avg speed and traffic overhead.
        Avoids hardcoded 10-minute timers.
        """
        if dist_km <= 0.1:
            return 2
        minutes = int(math.ceil((dist_km / 25.0) * 60)) + 3 # 3 mins buffer for signals/turns
        return max(5, minutes)

    @classmethod
    def create_delivery_request(
        cls,
        listing_id: str,
        ngo_id: str,
        ngo_name: str,
        requested_servings: int,
        dropoff_address: str,
        dropoff_lat: float,
        dropoff_lon: float,
        donor_name: str = "Grand Kitchen",
        food_title: str = "Surplus Meals",
        pickup_address: str = "New Delhi Kitchen",
        pickup_lat: float = 28.5975,
        pickup_lon: float = 77.1724
    ) -> Dict[str, Any]:
        delivery_id = f"deliv-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc)
        record = {
            "id": delivery_id,
            "listing_id": listing_id,
            "ngo_id": ngo_id,
            "ngo_name": ngo_name,
            "donor_name": donor_name,
            "food_title": food_title,
            "allocated_servings": requested_servings,
            "pickup_address": pickup_address,
            "pickup_lat": pickup_lat,
            "pickup_lon": pickup_lon,
            "dropoff_address": dropoff_address,
            "dropoff_lat": dropoff_lat,
            "dropoff_lon": dropoff_lon,
            "volunteer_id": None,
            "volunteer_name": None,
            "volunteer_phone": None,
            "volunteer_lat": None,
            "volunteer_lon": None,
            "status": "REQUESTED",
            "prep_time_minutes": 15,
            "estimated_travel_minutes": 20,
            "grace_period_minutes": 10,
            "pickup_deadline": None,
            "accepted_at": None,
            "collected_at": None,
            "delivered_at": None,
            "late_policy_status": "ON_TIME",
            "delay_history": [],
            "created_at": now
        }
        cls.DELIVERIES_DB[delivery_id] = record
        return record

    @classmethod
    def approve_request(
        cls,
        delivery_id: str,
        prep_time_minutes: int = 15,
        pickup_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")
        delivery["status"] = "APPROVED"
        delivery["prep_time_minutes"] = prep_time_minutes
        if pickup_instructions:
            delivery["pickup_instructions"] = pickup_instructions
        return delivery

    @classmethod
    def assign_volunteer(
        cls,
        delivery_id: str,
        volunteer_id: str,
        volunteer_name: str,
        volunteer_phone: str,
        vehicle_type: str,
        volunteer_lat: float,
        volunteer_lon: float
    ) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")
        delivery["status"] = "ASSIGNED"
        delivery["volunteer_id"] = volunteer_id
        delivery["volunteer_name"] = volunteer_name
        delivery["volunteer_phone"] = volunteer_phone
        delivery["volunteer_lat"] = volunteer_lat
        delivery["volunteer_lon"] = volunteer_lon
        delivery["vehicle_type"] = vehicle_type
        return delivery

    @classmethod
    def accept_assignment(cls, delivery_id: str, volunteer_id: str) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")
        
        now = datetime.now(timezone.utc)
        delivery["status"] = "EN_ROUTE_TO_PICKUP"
        delivery["accepted_at"] = now
        delivery["volunteer_id"] = volunteer_id

        # Calculate realistic ETA based on volunteer's distance from restaurant
        v_lat = delivery.get("volunteer_lat") or delivery["pickup_lat"] + 0.03
        v_lon = delivery.get("volunteer_lon") or delivery["pickup_lon"] + 0.03
        dist_km = cls.haversine_distance(v_lat, v_lon, delivery["pickup_lat"], delivery["pickup_lon"])
        travel_mins = cls.calculate_realistic_travel_mins(dist_km)
        prep_mins = delivery.get("prep_time_minutes", 15)
        grace_mins = delivery.get("grace_period_minutes", 10)

        delivery["estimated_travel_minutes"] = travel_mins
        # Server-side timezone-aware pickup deadline
        delivery["pickup_deadline"] = now + timedelta(minutes=prep_mins + travel_mins + grace_mins)
        delivery["late_policy_status"] = "ON_TIME"
        return delivery

    @classmethod
    def update_volunteer_location(
        cls,
        delivery_id: str,
        volunteer_id: str,
        lat: float,
        lon: float
    ) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")
        
        delivery["volunteer_lat"] = lat
        delivery["volunteer_lon"] = lon

        # Recalculate remaining distance to pickup
        dist_km = cls.haversine_distance(lat, lon, delivery["pickup_lat"], delivery["pickup_lon"])
        recalculated_travel_mins = cls.calculate_realistic_travel_mins(dist_km)
        delivery["estimated_travel_minutes"] = recalculated_travel_mins

        return delivery

    @classmethod
    def verify_proximity_arrival(
        cls,
        delivery_id: str,
        volunteer_id: str,
        current_lat: float,
        current_lon: float
    ) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")

        dist_km = cls.haversine_distance(current_lat, current_lon, delivery["pickup_lat"], delivery["pickup_lon"])
        
        # Proximity threshold: within 250 meters (0.25 km)
        if dist_km > 0.25:
            raise ValueError(f"Volunteer is {round(dist_km * 1000)}m away. Must be within 250m of pickup to confirm arrival.")

        delivery["status"] = "ARRIVED_AT_PICKUP"
        delivery["arrived_at"] = datetime.now(timezone.utc)
        return {
            "success": True,
            "message": "GPS proximity verified. Courier arrived at pickup location.",
            "distance_meters": round(dist_km * 1000, 1),
            "status": delivery["status"]
        }

    @classmethod
    def report_delay(
        cls,
        delivery_id: str,
        volunteer_id: str,
        delay_reason: str,
        delay_minutes: int,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")

        now = datetime.now(timezone.utc)
        if delivery.get("pickup_deadline"):
            delivery["pickup_deadline"] += timedelta(minutes=delay_minutes)
        delivery["estimated_travel_minutes"] += delay_minutes

        delay_record = {
            "delay_id": f"delay-{uuid.uuid4().hex[:6]}",
            "reason": delay_reason,
            "minutes_added": delay_minutes,
            "timestamp": now.isoformat(),
            "notes": notes or ""
        }
        delivery.setdefault("delay_history", []).append(delay_record)

        # Check late policy impact
        cls._evaluate_late_policy(delivery)

        return {
            "success": True,
            "message": f"Delay of {delay_minutes} mins recorded. New pickup deadline updated.",
            "new_deadline": delivery["pickup_deadline"],
            "delay_record": delay_record
        }

    @classmethod
    def _evaluate_late_policy(cls, delivery: Dict[str, Any]) -> str:
        """
        Transparent late policy evaluator:
        - ON_TIME: Current time <= deadline - grace_period
        - WITHIN_GRACE_PERIOD: deadline - grace_period < Current time <= deadline
        - MINOR_DELAY: deadline < Current time <= deadline + 15 mins
        - LATE: Current time > deadline + 15 mins (triggers reliability review)
        """
        if delivery.get("status") in ["COLLECTED", "DELIVERED"]:
            return "COMPLETED"

        deadline = delivery.get("pickup_deadline")
        if not deadline:
            return "ON_TIME"

        now = datetime.now(timezone.utc)
        grace = timedelta(minutes=delivery.get("grace_period_minutes", 10))

        if now <= deadline - grace:
            status = "ON_TIME"
        elif now <= deadline:
            status = "WITHIN_GRACE_PERIOD"
        elif now <= deadline + timedelta(minutes=15):
            status = "MINOR_DELAY"
        else:
            status = "LATE"

        delivery["late_policy_status"] = status
        return status

    @classmethod
    def get_live_pickup_status(cls, delivery_id: str) -> LivePickupStatusResponse:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")

        cls._evaluate_late_policy(delivery)
        now = datetime.now(timezone.utc)
        
        # Calculate distance
        v_lat = delivery.get("volunteer_lat") or delivery["pickup_lat"]
        v_lon = delivery.get("volunteer_lon") or delivery["pickup_lon"]
        dist_km = cls.haversine_distance(v_lat, v_lon, delivery["pickup_lat"], delivery["pickup_lon"])

        # Calculate seconds remaining
        seconds_remaining = 0
        if delivery.get("pickup_deadline"):
            diff = (delivery["pickup_deadline"] - now).total_seconds()
            seconds_remaining = max(0, int(diff))

        is_near = dist_km <= 0.25

        recent_delay = None
        if delivery.get("delay_history"):
            recent_delay = delivery["delay_history"][-1]["reason"]

        return LivePickupStatusResponse(
            delivery_id=delivery["id"],
            status=delivery["status"],
            volunteer_name=delivery.get("volunteer_name"),
            volunteer_phone=delivery.get("volunteer_phone"),
            volunteer_lat=delivery.get("volunteer_lat"),
            volunteer_lon=delivery.get("volunteer_lon"),
            pickup_lat=delivery["pickup_lat"],
            pickup_lon=delivery["pickup_lon"],
            dropoff_lat=delivery["dropoff_lat"],
            dropoff_lon=delivery["dropoff_lon"],
            distance_to_pickup_km=dist_km,
            estimated_arrival_minutes=delivery.get("estimated_travel_minutes", 15),
            seconds_remaining=seconds_remaining,
            pickup_deadline=delivery.get("pickup_deadline"),
            late_policy_status=delivery.get("late_policy_status", "ON_TIME"),
            is_delayed=len(delivery.get("delay_history", [])) > 0,
            delay_reason=recent_delay,
            is_near_pickup=is_near
        )

    @classmethod
    def reassign_volunteer(cls, delivery_id: str, reason: str) -> Dict[str, Any]:
        delivery = cls.DELIVERIES_DB.get(delivery_id)
        if not delivery:
            raise ValueError(f"Delivery record {delivery_id} not found.")
        
        prev_volunteer = delivery.get("volunteer_name")
        delivery["status"] = "APPROVED"
        delivery["volunteer_id"] = None
        delivery["volunteer_name"] = None
        delivery["volunteer_phone"] = None
        delivery["volunteer_lat"] = None
        delivery["volunteer_lon"] = None
        delivery["accepted_at"] = None
        delivery["pickup_deadline"] = None
        delivery.setdefault("delay_history", []).append({
            "action": "REASSIGNMENT",
            "reason": reason,
            "previous_volunteer": prev_volunteer,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        return {
            "success": True,
            "message": f"Assignment released for reassignment due to: {reason}.",
            "delivery": delivery
        }

