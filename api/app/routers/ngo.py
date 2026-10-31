from fastapi import APIRouter, HTTPException
from app.models.schemas import SplitAllocationRequest, SplitAllocationResponse
from app.services.matching_engine import SmartMatchingEngine
from app.routers.donations import SURPLUS_DB

router = APIRouter(prefix="/api/matching", tags=["Smart Matching & Allocation"])

@router.post("/allocate", response_model=SplitAllocationResponse)
def execute_smart_matching(req: SplitAllocationRequest):
    # Find active listing
    listing = next((item for item in SURPLUS_DB if item["id"] == req.listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Surplus food listing not found.")

    allocation_result = SmartMatchingEngine.allocate_surplus(
        listing_id=listing["id"],
        total_servings=listing["quantity_servings"],
        total_weight_kg=listing["weight_kg"],
        donor_lat=listing["latitude"],
        donor_lon=listing["longitude"],
        classification=listing.get("classification", "CATEGORY_A"),
        max_recipients=req.max_recipients or 3
    )

    listing["status"] = "MATCHED"
    return allocation_result

@router.get("/registered-ngos")
def get_registered_ngos():
    return SmartMatchingEngine.NGO_REGISTRY
