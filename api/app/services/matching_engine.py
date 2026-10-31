import math
from datetime import datetime, timezone
from typing import List
from app.models.schemas import SplitAllocationResponse, NGOAllocationRecipient

class SmartMatchingEngine:
    """
    Automated Proximity Matching & Multi-Recipient Batch Splitting Algorithm.
    Prevents localized over-supply by auto-splitting large surplus listings across multiple nearby NGO shelters.
    Supports Category A (Ambient) & Category B (Cold Chain Required) storage validation.
    """
    
    # NGO Database Registry (Delhi NCR / NSUT region focus)
    NGO_REGISTRY = [
        {
            "id": "ngo-101",
            "name": "Akshaya Patra Foundation Shelter",
            "address": "Dwarka Sector 10, New Delhi",
            "phone": "+91 98101 23456",
            "contact_person": "Rajesh Kumar (Dispatch Lead)",
            "lat": 28.5833,
            "lon": 77.0500,
            "capacity": 200,
            "has_cold_storage": True,
            "trust": 4.95
        },
        {
            "id": "ngo-102",
            "name": "Robin Hood Army - Janakpuri Center",
            "address": "Janakpuri Block B, New Delhi",
            "phone": "+91 98234 56789",
            "contact_person": "Priya Sharma (Volunteer Coordinator)",
            "lat": 28.6219,
            "lon": 77.0878,
            "capacity": 150,
            "has_cold_storage": False,
            "trust": 4.88
        },
        {
            "id": "ngo-103",
            "name": "Feeding India Shelter Home",
            "address": "Uttam Nagar East, New Delhi",
            "phone": "+91 98345 67890",
            "contact_person": "Amit Verma (Operations Manager)",
            "lat": 28.6254,
            "lon": 77.0645,
            "capacity": 180,
            "has_cold_storage": True,
            "trust": 4.92
        },
        {
            "id": "ngo-104",
            "name": "Roti Bank NGO Community Kitchen",
            "address": "Palam Colony, New Delhi",
            "phone": "+91 98456 78901",
            "contact_person": "Sanjay Gupta (Kitchen Lead)",
            "lat": 28.5861,
            "lon": 77.0789,
            "capacity": 100,
            "has_cold_storage": False,
            "trust": 4.85
        },
        {
            "id": "ngo-105",
            "name": "Gunj Care & Relief Shelter",
            "address": "Vasant Kunj Phase 2, New Delhi",
            "phone": "+91 98567 89012",
            "contact_person": "Neha Singh (Field Supervisor)",
            "lat": 28.5300,
            "lon": 77.1500,
            "capacity": 250,
            "has_cold_storage": True,
            "trust": 4.97
        }
    ]

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate geographical distance in km between two lat/lon coordinates."""
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    @classmethod
    def allocate_surplus(
        cls,
        listing_id: str,
        total_servings: int,
        total_weight_kg: float,
        donor_lat: float,
        donor_lon: float,
        classification: str = "CATEGORY_A",
        max_recipients: int = 3
    ) -> SplitAllocationResponse:
        
        # Filter NGOs if Category B (Cold Chain Required)
        eligible_ngos = cls.NGO_REGISTRY
        if classification == "CATEGORY_B":
            eligible_ngos = [ngo for ngo in cls.NGO_REGISTRY if ngo.get("has_cold_storage", False)]
            if not eligible_ngos:
                eligible_ngos = cls.NGO_REGISTRY # Fallback to all if none specified

        # Calculate distances & priority score for eligible NGOs
        scored_ngos = []
        for ngo in eligible_ngos:
            dist = cls.haversine_distance(donor_lat, donor_lon, ngo["lat"], ngo["lon"])
            est_mins = int(dist * 3.5 + 5) # estimated city traffic transit time
            
            # Priority Score formula: (Trust Score * 20) - (Distance * 3) + (Capacity / 50)
            priority_score = (ngo["trust"] * 20) - (dist * 3.0) + (ngo["capacity"] / 50.0)
            if classification == "CATEGORY_B" and ngo.get("has_cold_storage"):
                priority_score += 15.0 # Boost cold storage ready NGOs
            
            scored_ngos.append({
                **ngo,
                "distance_km": dist,
                "estimated_transit_mins": est_mins,
                "priority_score": priority_score
            })

        # Sort NGOs by priority score descending
        scored_ngos.sort(key=lambda x: x["priority_score"], reverse=True)
        selected_ngos = scored_ngos[:max_recipients]

        # Execute Automated Batch Splitting
        allocations: List[NGOAllocationRecipient] = []
        remaining_servings = total_servings
        weight_per_serving = total_weight_kg / float(total_servings) if total_servings > 0 else 0.3

        for idx, ngo in enumerate(selected_ngos):
            if remaining_servings <= 0:
                break
                
            if idx == len(selected_ngos) - 1:
                assigned = remaining_servings
            else:
                assigned = min(ngo["capacity"], math.ceil(total_servings / len(selected_ngos)))
                assigned = min(assigned, remaining_servings)

            remaining_servings -= assigned
            allocated_weight = round(assigned * weight_per_serving, 2)

            allocations.append(NGOAllocationRecipient(
                ngo_id=ngo["id"],
                ngo_name=ngo["name"],
                address=ngo["address"],
                phone=ngo.get("phone", "+91 98123 45678"),
                contact_person=ngo.get("contact_person", "Volunteer Lead"),
                allocated_servings=assigned,
                allocated_weight_kg=allocated_weight,
                distance_km=ngo["distance_km"],
                estimated_transit_mins=ngo["estimated_transit_mins"]
            ))

        return SplitAllocationResponse(
            listing_id=listing_id,
            total_servings=total_servings,
            allocations=allocations,
            matching_timestamp=datetime.now(timezone.utc)
        )
