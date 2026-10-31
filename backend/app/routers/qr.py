from fastapi import APIRouter
from app.models.schemas import QRHandshakeCreate, QRVerificationResponse, QRVerifyRequest, QRVerifyResult
from app.services.qr_service import QRHandshakeService
from app.services.impact_tracker import ImpactTrackerService

router = APIRouter(prefix="/api/qr", tags=["QR Verification Handshake"])

@router.post("/generate", response_model=QRVerificationResponse)
def create_verification_qr(payload: QRHandshakeCreate):
    return QRHandshakeService.generate_verification_qr(
        allocation_id=payload.allocation_id,
        donor_id=payload.donor_id,
        recipient_ngo_id=payload.recipient_ngo_id,
        servings=payload.servings
    )

@router.post("/verify", response_model=QRVerifyResult)
def verify_pickup_qr(req: QRVerifyRequest):
    result = QRHandshakeService.verify_token(req.verification_token, req.scanned_by_role)
    if result.success:
        ImpactTrackerService.record_successful_handshake(result.meals_rescued)
    return result
