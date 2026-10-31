from fastapi import APIRouter
from app.models.schemas import ImpactMetricsResponse
from app.services.impact_tracker import ImpactTrackerService

router = APIRouter(prefix="/api/analytics", tags=["Impact Analytics & Leaderboard"])

@router.get("/impact", response_model=ImpactMetricsResponse)
def get_live_impact_metrics():
    return ImpactTrackerService.get_current_metrics()

@router.get("/leaderboard")
def get_community_leaderboards():
    return ImpactTrackerService.get_leaderboard()
