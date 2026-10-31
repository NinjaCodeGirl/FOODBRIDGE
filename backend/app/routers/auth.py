import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Request, status
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    check_login_rate_limit,
    record_failed_login,
    clear_login_attempts
)

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

# --- Schemas ---
class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    full_name: str
    role: str = Field(..., description="RESTAURANT, NGO, VOLUNTEER, or ADMIN")
    organization_name: Optional[str] = None
    phone_number: Optional[str] = None
    fssai_license: Optional[str] = None
    darpan_id: Optional[str] = None
    vehicle_type: Optional[str] = None
    service_radius_km: Optional[int] = 15

class UserLoginRequest(BaseModel):
    email: str
    password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str
    organization_name: Optional[str] = None
    expires_in_hours: int = 24

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_name: Optional[str] = None
    phone_number: Optional[str] = None
    fssai_license: Optional[str] = None
    darpan_id: Optional[str] = None
    vehicle_type: Optional[str] = None
    service_radius_km: Optional[int] = 15
    trust_score: float = 5.0
    created_at: datetime

# --- In-Memory Persistent User Registry ---
# Pre-seeded with cryptographically hashed passwords for the 4 platform personas
DEFAULT_DEMO_PASSWORD = "FoodBridge@2026!"
USERS_DB: Dict[str, Dict[str, Any]] = {
    "user-donor-01": {
        "id": "user-donor-01",
        "email": "taj@foodbridge.org",
        "password_hash": hash_password(DEFAULT_DEMO_PASSWORD),
        "full_name": "Chef Vikram Batra",
        "role": "RESTAURANT",
        "organization_name": "The Grand Kitchen & Banquets (Taj Palace)",
        "phone_number": "+91 98999 11223",
        "fssai_license": "10019011000452",
        "darpan_id": None,
        "vehicle_type": None,
        "service_radius_km": 15,
        "trust_score": 4.98,
        "created_at": datetime.now(timezone.utc)
    },
    "user-ngo-01": {
        "id": "user-ngo-01",
        "email": "akshaya@foodbridge.org",
        "password_hash": hash_password(DEFAULT_DEMO_PASSWORD),
        "full_name": "Rajesh Kumar",
        "role": "NGO",
        "organization_name": "Akshaya Patra Foundation Shelter",
        "phone_number": "+91 98101 23456",
        "fssai_license": None,
        "darpan_id": "DL/2021/029182",
        "vehicle_type": None,
        "service_radius_km": 20,
        "trust_score": 4.95,
        "created_at": datetime.now(timezone.utc)
    },
    "user-volunteer-01": {
        "id": "user-volunteer-01",
        "email": "arjun@foodbridge.org",
        "password_hash": hash_password(DEFAULT_DEMO_PASSWORD),
        "full_name": "Arjun Sharma",
        "role": "VOLUNTEER",
        "organization_name": "Independent Delhi Food Rescue",
        "phone_number": "+91 98234 56789",
        "fssai_license": None,
        "darpan_id": None,
        "vehicle_type": "Insulated Delivery Van (DL-3C-9821)",
        "service_radius_km": 15,
        "trust_score": 4.91,
        "created_at": datetime.now(timezone.utc)
    },
    "user-admin-01": {
        "id": "user-admin-01",
        "email": "admin@foodbridge.org",
        "password_hash": hash_password(DEFAULT_DEMO_PASSWORD),
        "full_name": "Pooja Verma",
        "role": "ADMIN",
        "organization_name": "FoodBridge Platform Trust Authority",
        "phone_number": "+91 1800 200 4567",
        "fssai_license": None,
        "darpan_id": None,
        "vehicle_type": None,
        "service_radius_km": 50,
        "trust_score": 5.0,
        "created_at": datetime.now(timezone.utc)
    }
}

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegisterRequest):
    """
    Registers a new platform user with server-side password hashing and JWT issuance.
    Enforces role constraints and uniqueness of email.
    """
    normalized_email = payload.email.lower().strip()
    
    # Check duplicate
    for u in USERS_DB.values():
        if u["email"].lower() == normalized_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An account with email '{payload.email}' already exists."
            )

    # Normalize role
    role = payload.role.upper().strip()
    if role in ["DONOR", "RESTAURANT"]:
        role = "RESTAURANT"
    elif role in ["NGO", "RECIPIENT", "SHELTER"]:
        role = "NGO"
    elif role in ["VOLUNTEER", "COURIER", "DRIVER"]:
        role = "VOLUNTEER"
    elif role == "ADMIN":
        role = "ADMIN"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Must be RESTAURANT, NGO, VOLUNTEER, or ADMIN."
        )

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    record = {
        "id": user_id,
        "email": normalized_email,
        "password_hash": hash_password(payload.password),
        "full_name": payload.full_name.strip(),
        "role": role,
        "organization_name": payload.organization_name or payload.full_name,
        "phone_number": payload.phone_number,
        "fssai_license": payload.fssai_license,
        "darpan_id": payload.darpan_id,
        "vehicle_type": payload.vehicle_type,
        "service_radius_km": payload.service_radius_km or 15,
        "trust_score": 5.0,
        "created_at": datetime.now(timezone.utc)
    }
    USERS_DB[user_id] = record

    # Issue Access Token
    token = create_access_token({
        "sub": user_id,
        "email": normalized_email,
        "role": role,
        "full_name": record["full_name"],
        "organization_name": record["organization_name"]
    })

    return AuthTokenResponse(
        access_token=token,
        user_id=user_id,
        email=normalized_email,
        full_name=record["full_name"],
        role=role,
        organization_name=record["organization_name"],
        expires_in_hours=24
    )

@router.post("/login", response_model=AuthTokenResponse)
def login_user(payload: UserLoginRequest, request: Request):
    """
    Authenticates a user against PBKDF2 password hashes with rate limiting.
    Issues a cryptographically signed JWT token with verified role claims.
    """
    normalized_email = payload.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown_ip"
    rate_limit_key = f"{client_ip}:{normalized_email}"

    # Rate limiting check (max 5 failed attempts in 5 minutes)
    check_login_rate_limit(rate_limit_key)

    user = next((u for u in USERS_DB.values() if u["email"].lower() == normalized_email), None)
    if not user or not verify_password(payload.password, user["password_hash"]):
        record_failed_login(rate_limit_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email and password."
        )

    # Successful login: clear rate limit counter
    clear_login_attempts(rate_limit_key)

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
        "organization_name": user.get("organization_name")
    })

    return AuthTokenResponse(
        access_token=token,
        user_id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        organization_name=user.get("organization_name"),
        expires_in_hours=24
    )

@router.get("/me", response_model=UserProfileResponse)
def get_authenticated_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns the server-verified profile of the currently authenticated token subject.
    """
    user_id = current_user.get("sub")
    user = USERS_DB.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user record not found in registry."
        )
    return UserProfileResponse(**user)
