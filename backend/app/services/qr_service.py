import io
import base64
import jwt
import uuid
import qrcode
from datetime import datetime, timezone, timedelta
from app.config import settings
from app.models.schemas import QRVerificationResponse, QRVerifyResult

class QRHandshakeService:
    """
    Cryptographic QR Verification Token Generator & Handoff Validation Service.
    Generates secure JWT payload embedded into QR code image scanned at pickup.
    """

    @classmethod
    def generate_verification_qr(
        cls,
        allocation_id: str,
        donor_id: str,
        recipient_ngo_id: str,
        servings: int
    ) -> QRVerificationResponse:
        
        handshake_id = f"hs-{uuid.uuid4().hex[:12]}"
        
        # Generate JWT Payload
        payload = {
            "handshake_id": handshake_id,
            "allocation_id": allocation_id,
            "donor_id": donor_id,
            "recipient_ngo_id": recipient_ngo_id,
            "servings": servings,
            "iss": "FoodBridge-Ledger-v1",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=6)
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # Generate QR Code PNG image in Base64
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(token)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_b64 = f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"

        return QRVerificationResponse(
            handshake_id=handshake_id,
            verification_token=token,
            qr_code_base64=qr_b64,
            status="PENDING_PICKUP"
        )

    @classmethod
    def verify_token(cls, token: str, scanned_by_role: str = "NGO") -> QRVerifyResult:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            servings = payload.get("servings", 50)
            
            # Calculate Environmental Impact Metrics
            # Formula: 2.5 kg CO2 avoided per meal rescued
            co2_mitigated = round(servings * 2.5, 2)

            return QRVerifyResult(
                success=True,
                message=f"Cryptographic Handshake Verified! Successfully transferred {servings} meals.",
                co2_mitigated_kg=co2_mitigated,
                meals_rescued=servings,
                updated_trust_score=4.96
            )
        except jwt.ExpiredSignatureError:
            return QRVerifyResult(
                success=False,
                message="Verification failed: QR token has expired.",
                co2_mitigated_kg=0.0,
                meals_rescued=0,
                updated_trust_score=0.0
            )
        except Exception as e:
            return QRVerifyResult(
                success=False,
                message=f"Verification failed: Invalid signature token ({str(e)}).",
                co2_mitigated_kg=0.0,
                meals_rescued=0,
                updated_trust_score=0.0
            )
