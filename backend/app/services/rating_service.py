import uuid
import logging
from datetime import datetime, timezone
from typing import List
from app.config import settings
from app.models.schemas import TrustRatingCreate, TrustRatingResponse

logger = logging.getLogger(__name__)

# Attempt Supabase client if available
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY and "dummy" not in settings.SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        logger.warning(f"Could not connect to Supabase: {e}")

# Local in-memory ratings store
RATINGS_DB: List[dict] = [
    {
        "id": "rate-101",
        "target_org_id": "org-taj-palace",
        "target_org_name": "Taj Palace Hotel Kitchen",
        "evaluator_role": "NGO",
        "evaluator_name": "Akshaya Patra Dispatcher",
        "rating": 5,
        "hygiene_rating": 5,
        "punctuality_rating": 5,
        "feedback_text": "Exceptional food hygiene and temperature holding packaging!",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "rate-102",
        "target_org_id": "org-nsut-dining",
        "target_org_name": "NSUT Campus Dining Hall",
        "evaluator_role": "NGO",
        "evaluator_name": "Robin Hood Army Lead",
        "rating": 5,
        "hygiene_rating": 5,
        "punctuality_rating": 4,
        "feedback_text": "Freshly cooked meals, smooth pickup process at gate 3.",
        "created_at": datetime.now(timezone.utc)
    }
]

class RatingService:
    """
    Trust Rating & Review Ledger Service.
    Tracks donor hygiene scores and NGO punctuality scores.
    """

    @classmethod
    def submit_rating(cls, data: TrustRatingCreate) -> TrustRatingResponse:
        rate_id = f"rate-{uuid.uuid4().hex[:8]}"
        created_at = datetime.now(timezone.utc)

        record = {
            "id": rate_id,
            "target_org_id": data.target_org_id,
            "target_org_name": data.target_org_name,
            "evaluator_role": data.evaluator_role,
            "evaluator_name": data.evaluator_name,
            "rating": data.rating,
            "hygiene_rating": data.hygiene_rating or 5,
            "punctuality_rating": data.punctuality_rating or 5,
            "feedback_text": data.feedback_text or "Great partnership!",
            "created_at": created_at
        }

        RATINGS_DB.insert(0, record)

        if supabase_client:
            try:
                supabase_client.table("trust_ratings").insert({
                    "id": rate_id,
                    "target_org_name": data.target_org_name,
                    "evaluator_role": data.evaluator_role,
                    "rating": data.rating,
                    "hygiene_rating": data.hygiene_rating or 5,
                    "punctuality_rating": data.punctuality_rating or 5,
                    "feedback_text": data.feedback_text
                }).execute()
            except Exception as e:
                logger.warning(f"Supabase rating insert failed: {e}")

        return TrustRatingResponse(**record)

    @classmethod
    def get_ratings_history(cls) -> List[TrustRatingResponse]:
        return [TrustRatingResponse(**r) for r in RATINGS_DB]
