import hashlib
import secrets
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

# HTTP Bearer Security Scheme
security_bearer = HTTPBearer(auto_error=False)

# In-Memory Rate Limiting for Login Attempts
# Format: { "identifier": [timestamp, timestamp, ...] }
LOGIN_RATE_LIMIT_DB: Dict[str, List[datetime]] = {}
MAX_LOGIN_ATTEMPTS = 5
RATE_LIMIT_WINDOW_SECONDS = 300 # 5 minutes

def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a random salt.
    Returns: 'pbkdf2:sha256:100000$<salt_hex>$<hash_hex>'
    """
    salt = secrets.token_hex(16)
    iterations = 100_000
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    return f"pbkdf2:sha256:{iterations}${salt}${hash_bytes.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored PBKDF2-HMAC-SHA256 hash.
    Constant-time comparison protects against timing attacks.
    """
    try:
        parts = hashed_password.split('$')
        if len(parts) != 3:
            return False
        algo_iter, salt, expected_hash = parts
        _, _, iter_str = algo_iter.split(':')
        iterations = int(iter_str)
        computed_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        ).hex()
        return secrets.compare_digest(computed_hash, expected_hash)
    except Exception:
        return False

def check_login_rate_limit(identifier: str) -> bool:
    """
    Checks if an IP or email has exceeded the allowed login rate.
    Returns True if allowed, raises HTTPException 429 if rate limited.
    """
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    
    attempts = LOGIN_RATE_LIMIT_DB.get(identifier, [])
    # Retain only attempts within window
    recent_attempts = [t for t in attempts if t > cutoff]
    
    if len(recent_attempts) >= MAX_LOGIN_ATTEMPTS:
        retry_after = int((recent_attempts[0] + timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS) - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please try again in {max(1, retry_after)} seconds."
        )
    return True

def record_failed_login(identifier: str):
    """Records a failed login attempt for rate limiting."""
    now = datetime.now(timezone.utc)
    if identifier not in LOGIN_RATE_LIMIT_DB:
        LOGIN_RATE_LIMIT_DB[identifier] = []
    LOGIN_RATE_LIMIT_DB[identifier].append(now)

def clear_login_attempts(identifier: str):
    """Clears rate-limit records on successful login."""
    LOGIN_RATE_LIMIT_DB.pop(identifier, None)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    """Decodes and validates a JWT access token."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please log in again."
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature."
        )

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> dict:
    """
    FastAPI dependency to extract and verify authenticated user profile from Bearer JWT.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token in Authorization header."
        )
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: missing subject identifier."
        )
    return payload

def require_roles(allowed_roles: List[str]):
    """
    Factory dependency for role-based access control.
    Enforces server-side authorization: browser-supplied roles are ignored.
    """
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role", "").upper()
        # Normalize synonyms (DONOR == RESTAURANT, COURIER == VOLUNTEER)
        normalized_allowed = [r.upper() for r in allowed_roles]
        if "RESTAURANT" in normalized_allowed and "DONOR" not in normalized_allowed:
            normalized_allowed.append("DONOR")
        if "DONOR" in normalized_allowed and "RESTAURANT" not in normalized_allowed:
            normalized_allowed.append("RESTAURANT")
        if "VOLUNTEER" in normalized_allowed and "COURIER" not in normalized_allowed:
            normalized_allowed.append("COURIER")
            
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles [{', '.join(allowed_roles)}]. Your verified role is '{user_role}'."
            )
        return current_user
    return role_checker

