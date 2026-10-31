import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from app.models.schemas import SurplusListingCreate, SurplusListingResponse, FreshnessEvaluationResult
from app.services.freshness_ai import AzureFreshnessAIEngine

router = APIRouter(prefix="/api/donations", tags=["Surplus Food Listings"])

# In-memory database store
SURPLUS_DB = [
    {
        "id": "list-001",
        "donor_name": "NSUT Campus Dining Hall",
        "donor_phone": "+91 98765 43210",
        "food_title": "Fresh Cooked Dal Makhani & Rice",
        "food_category": "COOKED_MEALS",
        "classification": "CATEGORY_A",
        "quantity_servings": 180,
        "weight_kg": 54.0,
        "freshness_score": 94.50,
        "risk_level": "LOW",
        "allergens": ["Dairy", "Gluten"],
        "validation_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "estimated_shelf_life_hours": 5.2,
        "status": "AVAILABLE",
        "pickup_address": "NSUT Main Campus, Sector 3, Dwarka, New Delhi",
        "latitude": 28.6100,
        "longitude": 77.0380,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "list-002",
        "donor_name": "Taj Palace Banquet Kitchen",
        "donor_phone": "+91 98999 11223",
        "food_title": "Assorted Paneer Gravy & Rotis",
        "food_category": "COOKED_MEALS",
        "classification": "CATEGORY_B",
        "quantity_servings": 350,
        "weight_kg": 105.0,
        "freshness_score": 88.00,
        "risk_level": "LOW",
        "allergens": ["Dairy", "Gluten"],
        "validation_hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        "estimated_shelf_life_hours": 4.5,
        "status": "AVAILABLE",
        "pickup_address": "Sardar Patel Marg, Diplomatic Enclave, New Delhi",
        "latitude": 28.5975,
        "longitude": 77.1724,
        "created_at": datetime.now(timezone.utc)
    }
]

@router.post("/create", response_model=SurplusListingResponse)
def create_surplus_listing(listing: SurplusListingCreate):
    # Run AI Freshness & Shelf-Life Assessment
    eval_result: FreshnessEvaluationResult = AzureFreshnessAIEngine.evaluate_freshness(
        food_title=listing.food_title,
        food_category=listing.food_category,
        preparation_timestamp=listing.preparation_timestamp,
        storage_condition=listing.storage_condition,
        classification=listing.classification
    )

    if eval_result.safety_category == "EXPIRED" or eval_result.risk_level == "CRITICAL":
        raise HTTPException(
            status_code=400,
            detail="Surplus food freshness score below safety threshold. Cannot list for human consumption."
        )

    new_id = f"list-{uuid.uuid4().hex[:8]}"
    item = {
        "id": new_id,
        "donor_name": listing.donor_name,
        "donor_phone": listing.donor_phone or "+91 98765 43210",
        "food_title": listing.food_title,
        "food_category": listing.food_category,
        "dietary_type": listing.dietary_type or "VEGETARIAN",
        "classification": listing.classification or "CATEGORY_A",
        "quantity_servings": listing.quantity_servings,
        "weight_kg": listing.weight_kg,
        "packaging_type": listing.packaging_type or "INSULATED_CONTAINERS",
        "freshness_score": eval_result.freshness_score,
        "risk_level": eval_result.risk_level,
        "allergens": eval_result.allergens,
        "validation_hash": eval_result.validation_hash,
        "estimated_shelf_life_hours": eval_result.estimated_shelf_life_hours,
        "status": "AVAILABLE",
        "pickup_address": listing.pickup_address,
        "latitude": listing.latitude,
        "longitude": listing.longitude,
        "pickup_deadline": listing.pickup_deadline or (datetime.now(timezone.utc) + timedelta(hours=eval_result.estimated_shelf_life_hours)),
        "created_at": datetime.now(timezone.utc)
    }
    SURPLUS_DB.insert(0, item)
    return item

@router.get("/active", response_model=list[SurplusListingResponse])
def get_active_listings():
    return [item for item in SURPLUS_DB if item["status"] in ["AVAILABLE", "MATCHED"]]

@router.post("/ai-screen", response_model=FreshnessEvaluationResult)
async def ai_screen_food_donation(
    file: Optional[UploadFile] = File(None),
    food_title: str = Form(...),
    food_category: str = Form("COOKED_MEALS"),
    storage_condition: str = Form("REFRIGERATED"),
    classification: str = Form("CATEGORY_A"),
    preparation_timestamp: Optional[str] = Form(None)
):
    """
    Multimodal AI Freshness & Shelf-Life Assessment Endpoint.
    Performs visual inspection of container/food photograph via Gemini vision
    with thermodynamic temperature decay curve calibration.
    """
    prep_time = datetime.now(timezone.utc)
    if preparation_timestamp:
        try:
            prep_time = datetime.fromisoformat(preparation_timestamp.replace('Z', '+00:00'))
        except Exception:
            pass

    image_bytes = b""
    mime_type = "image/jpeg"
    if file:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"

    if image_bytes:
        return AzureFreshnessAIEngine.evaluate_freshness_multimodal(
            image_bytes=image_bytes,
            mime_type=mime_type,
            food_title=food_title,
            food_category=food_category,
            preparation_timestamp=prep_time,
            storage_condition=storage_condition,
            classification=classification
        )

    return AzureFreshnessAIEngine.evaluate_freshness(
        food_title=food_title,
        food_category=food_category,
        preparation_timestamp=prep_time,
        storage_condition=storage_condition,
        classification=classification
    )

