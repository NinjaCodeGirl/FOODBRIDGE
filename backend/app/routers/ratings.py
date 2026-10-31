from fastapi import APIRouter
from typing import List
from app.models.schemas import TrustRatingCreate, TrustRatingResponse
from app.services.rating_service import RatingService

router = APIRouter(prefix="/api/ratings", tags=["Trust Rating & Review System"])

@router.post("/submit", response_model=TrustRatingResponse)
def submit_rating(data: TrustRatingCreate):
    """
    Submit a 1-5 star rating and review for donor hygiene or NGO punctuality.
    """
    return RatingService.submit_rating(data)

@router.get("/history", response_model=List[TrustRatingResponse])
def get_ratings_history():
    """
    Fetch all verified trust ratings and reviews.
    """
    return RatingService.get_ratings_history()
