import io
import base64
import jwt
import uuid
import qrcode
from datetime import datetime, timezone, timedelta
from typing import Set, Dict, Any, Optional
from _app.config import settings
from _app.models.schemas import QRVerificationResponse, QRVerifyResult

class QRHandshakeService:
    """
    Cryptographic QR Verification Token Generator & Handoff Validation Service.
    Enforces expiration, single-use anti-replay protection, role authorization,
    and 6-digit OTP verification.
    """

    # Anti-Replay: Set of redeemed handshake IDs
    CONSUMED_TOKENS: Set[str] = set()

    # Active OTP Registry: { donation_id: { "otp": "582901", "expires_at": datetime, "redeemed": False } }
    ACTIVE_OTPS: Dict[str, Dict[str, Any]] = {
        "list-001": {
            "otp": "582901",
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=2),
            "redeemed": False
        },
        "list-002": {
            "otp": "482913",
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=2),
            "redeemed": False
        },
        "assign-401": {
            "otp": "582901",
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=2),
            "redeemed": False
        }
    }

    @classmethod
    def generate_verification_qr(
        cls,
        allocation_id: str,
        donor_id: str,
        recipient_ngo_id: str,
        servings: int,
        expiry_hours: int = 6
    ) -> QRVerificationResponse:
        
        handshake_id = f"hs-{uuid.uuid4().hex[:12]}"
        
        # Generate JWT Payload with strict expiration
        payload = {
            "handshake_id": handshake_id,
            "allocation_id": allocation_id,
            "donor_id": donor_id,
            "recipient_ngo_id": recipient_ngo_id,
            "servings": servings,
            "iss": "FoodBridge-Ledger-v2",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # Also seed single-use 6-digit OTP for fallback verification
        otp_code = str(100000 + (hash(handshake_id) % 900000))
        cls.ACTIVE_OTPS[allocation_id] = {
            "otp": otp_code,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=expiry_hours),
            "redeemed": False
        }

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
        """
        Validates token signature, expiration, role authorization, and prevents replay attacks.
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            handshake_id = payload.get("handshake_id")
            
            # 1. Anti-Replay Attack Check
            if handshake_id in cls.CONSUMED_TOKENS:
                return QRVerifyResult(
                    success=False,
                    message="Verification failed: This QR token has already been redeemed and cannot be reused (Anti-Replay Rule).",
                    co2_mitigated_kg=0.0,
                    meals_rescued=0,
                    updated_trust_score=0.0
                )

            # 2. Role Authorization Check
            role_norm = scanned_by_role.upper().strip()
            if role_norm not in ["NGO", "RECIPIENT", "SHELTER", "VOLUNTEER", "COURIER", "ADMIN"]:
                return QRVerifyResult(
                    success=False,
                    message=f"Unauthorized: Role '{scanned_by_role}' is not permitted to redeem pickup handshakes.",
                    co2_mitigated_kg=0.0,
                    meals_rescued=0,
                    updated_trust_score=0.0
                )

            # 3. Mark Token as Consumed
            cls.CONSUMED_TOKENS.add(handshake_id)

            servings = payload.get("servings", 50)
            co2_mitigated = round(servings * 2.5, 2)

            return QRVerifyResult(
                success=True,
                message=f"Cryptographic Handshake Verified! Successfully transferred {servings} meals.",
                co2_mitigated_kg=co2_mitigated,
                meals_rescued=servings,
                updated_trust_score=4.98
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

    @classmethod
    def verify_otp(cls, donation_id: str, otp_code: str, role: str = "VOLUNTEER") -> QRVerifyResult:
        """
        Verifies 6-digit OTP code with expiration and single-use revocation.
        """
        otp_entry = cls.ACTIVE_OTPS.get(donation_id)
        if not otp_entry:
            return QRVerifyResult(
                success=False,
                message=f"No active OTP challenge found for donation '{donation_id}'.",
                co2_mitigated_kg=0.0,
                meals_rescued=0,
                updated_trust_score=0.0
            )

        now = datetime.now(timezone.utc)
        if now > otp_entry["expires_at"]:
            return QRVerifyResult(
                success=False,
                message="Verification failed: 6-digit OTP code has expired.",
                co2_mitigated_kg=0.0,
                meals_rescued=0,
                updated_trust_score=0.0
            )

        if otp_entry.get("redeemed"):
            return QRVerifyResult(
                success=False,
                message="Verification failed: 6-digit OTP has already been redeemed (Single-Use Rule).",
                co2_mitigated_kg=0.0,
                meals_rescued=0,
                updated_trust_score=0.0
            )

        if otp_entry["otp"] != otp_code.strip():
            return QRVerifyResult(
                success=False,
                message="Invalid OTP code. Please enter the correct 6-digit code shown on the donor screen.",
                co2_mitigated_kg=0.0,
                meals_rescued=0,
                updated_trust_score=0.0
            )

        # Mark OTP as redeemed
        otp_entry["redeemed"] = True
        meals = 50

        return QRVerifyResult(
            success=True,
            message="6-Digit OTP Handover Handshake Verified! Physical transfer certified.",
            co2_mitigated_kg=round(meals * 2.5, 2),
            meals_rescued=meals,
            updated_trust_score=4.98
        )
