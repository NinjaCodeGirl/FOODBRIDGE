# UNION FOOD BRIDGE — REST API Specification & Architecture Manual

**API Version**: 2.0.0  
**Base URL**: `https://union-food-bridge.vercel.app/api` (Local: `http://localhost:8000/api`)  
**Interactive Docs**: `http://localhost:8000/docs` (Swagger UI) / `http://localhost:8000/redoc` (ReDoc)  
**Authentication**: Bearer JWT Token (`Authorization: Bearer <token>`)

---

## 1. Authentication & RBAC (`/api/auth`)

### `POST /api/auth/register`
Registers a new user account with PBKDF2 password hashing.
- **Request Body**:
  ```json
  {
    "email": "chef@grandkitchen.com",
    "password": "SecurePassword@123",
    "name": "Chef Rajesh",
    "role": "RESTAURANT",
    "organization_name": "Grand Kitchen Delhi",
    "phone": "+91 98111 22334",
    "fssai_license": "FSSAI-1100223344",
    "service_radius_km": 15.0
  }
  ```
- **Response**: `200 OK` with `access_token`, `token_type`, `role`, and user profile. Rejects duplicate emails with `400 Bad Request`.

### `POST /api/auth/login`
Authenticates credentials and returns a signed JWT access token.
- **Request Body**:
  ```json
  {
    "email": "taj@foodbridge.org",
    "password": "FoodBridge@2026!"
  }
  ```
- **Response**: `200 OK` with JWT token. Rejects invalid passwords with `401 Unauthorized`. Rate limited to 5 failed attempts per 5 minutes.

### `GET /api/auth/me`
Retrieves currently authenticated subject's profile from the Bearer token.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with user record.

---

## 2. Rapid Pickup & Live Telemetry (`/api/deliveries`)

### `POST /api/deliveries/request`
Step 1: NGO requests food portions from an active listing.
- **Request Body**:
  ```json
  {
    "listing_id": "list-001",
    "ngo_id": "ngo-101",
    "ngo_name": "Akshaya Patra Foundation",
    "requested_servings": 50,
    "dropoff_address": "Dwarka Sector 10 Hub",
    "dropoff_lat": 28.5833,
    "dropoff_lon": 77.0500,
    "contact_phone": "+91 98101 23456"
  }
  ```
- **Response**: `200 OK` with delivery record (`status="REQUESTED"`). Atomically reserves portions from surplus listing stock.

### `POST /api/deliveries/approve`
Step 2: Restaurant approves the request and specifies kitchen preparation time.
- **Request Body**:
  ```json
  {
    "delivery_id": "deliv-401",
    "prep_time_minutes": 20,
    "pickup_instructions": "Service dock loading bay 2"
  }
  ```
- **Response**: `200 OK` (`status="APPROVED"`).

### `POST /api/deliveries/assign`
Step 3: Assigns volunteer courier with vehicle telemetry.
- **Request Body**:
  ```json
  {
    "delivery_id": "deliv-401",
    "volunteer_id": "user_arjun_volunteer",
    "volunteer_name": "Arjun Sharma",
    "volunteer_phone": "+91 98222 33445",
    "vehicle_type": "INSULATED_VAN",
    "volunteer_lat": 28.6050,
    "volunteer_lon": 77.1600
  }
  ```
- **Response**: `200 OK` (`status="ASSIGNED"`).

### `POST /api/deliveries/accept`
Step 4: Volunteer accepts the assignment.
- **Query Params**: `delivery_id`, `volunteer_id`
- **Response**: `200 OK` (`status="EN_ROUTE_TO_PICKUP"`). Calculates realistic travel time based on distance (not static 10m) and generates server-side `pickup_deadline`.

### `POST /api/deliveries/location-ping`
Step 5: Mobile client sends live GPS coordinates.
- **Request Body**:
  ```json
  {
    "delivery_id": "deliv-401",
    "volunteer_id": "user_arjun_volunteer",
    "current_lat": 28.6000,
    "current_lon": 77.1680
  }
  ```
- **Response**: `200 OK` with recalculated `estimated_travel_minutes`.

### `POST /api/deliveries/arrive`
Step 6: GPS proximity check to confirm arrival at restaurant loading dock.
- **Request Body**:
  ```json
  {
    "delivery_id": "deliv-401",
    "volunteer_id": "user_arjun_volunteer",
    "current_lat": 28.5980,
    "current_lon": 77.1720
  }
  ```
- **Response**: `200 OK` if within 250m (`status="ARRIVED_AT_PICKUP"`). If distant, returns `400 Bad Request`.

### `POST /api/deliveries/report-delay`
Step 7: Volunteer reports standardized delay reason.
- **Request Body**:
  ```json
  {
    "delivery_id": "deliv-401",
    "volunteer_id": "user_arjun_volunteer",
    "delay_reason": "HEAVY_TRAFFIC",
    "delay_minutes": 15,
    "notes": "Flyover congestion near Ring Road"
  }
  ```
- **Response**: `200 OK` with extended `new_deadline` and delay record logged.

### `GET /api/deliveries/{delivery_id}/status`
Retrieves live countdown, distance to pickup, seconds remaining, and transparent late policy status (`ON_TIME`, `WITHIN_GRACE_PERIOD`, `MINOR_DELAY`, `LATE`).

---

## 3. Food Safety, AI Freshness & Reconciliation (`/api/donations`)

### `POST /api/donations/create`
Submits surplus food listing with Category A/B classification, temperature storage, and FSSAI preparation timestamp.

### `POST /api/donations/ai-screen`
Multimodal visual AI screening calculating thermodynamic decay factor, remaining shelf life, and honest source attribution (`GEMINI_MULTIMODAL` vs. `DETERMINISTIC_HEURISTIC`).

### `GET /api/donations/security-report`
Aggregated food security reporting: total listed, rescued, distributed, rejected, spoiled, unclaimed, beneficiary count, and CO2 offset.

### `GET /api/donations/{listing_id}/reconciliation`
Mathematical inventory reconciliation proving:
$$\text{Total Listed} = \text{Available} + \text{Reserved} + \text{In-Transit} + \text{Delivered} + \text{Spoiled}$$

---

## 4. TrustChain QR & Multipart Evidence Vault (`/api/qr` & `/api/evidence`)

### `POST /api/qr/generate`
Generates cryptographically signed, expiring QR verification token with HMAC-SHA256 signature.

### `POST /api/qr/verify`
Redeems pickup QR token with anti-replay tracking (`CONSUMED_TOKENS`). Rejects replay attacks.

### `POST /api/qr/verify-otp`
Redeems single-use 6-digit offline emergency OTP. Revoked immediately upon first use.

### `POST /api/evidence/upload`
Accepts multipart image/video uploads (JPEG, PNG, WEBP, MP4, WEBM; max 25MB). Computes server-side SHA-256 fingerprint and saves to `backend/uploads/`.

---

## 5. In-App Notifications (`/api/notifications`)

### `GET /api/notifications`
Returns notifications filtered by user role, sorted newest first.

### `GET /api/notifications/unread-count`
Returns badge count of unread alerts for current user/role.

### `POST /api/notifications/mark-read/{id}`
Marks individual notification as read.

### `POST /api/notifications/mark-all-read`
Marks all notifications as read for current persona.

### `POST /api/notifications/dispatch`
Internal system dispatcher triggering alerts across all 10 platform lifecycle stages.

---

## 6. Subscriptions, Payments & Revenue (`/api/subscriptions` & `/api/revenue`)

### `GET /api/subscriptions/plans`
Returns the 4 subscription tiers (Community Free ₹0, Food Partner Pro ₹999, Business Plus ₹2,999, Enterprise & CSR Custom).

### `POST /api/subscriptions/sandbox-checkout`
Executes simulated checkout and generates downloadable billing invoice.

### `POST /api/subscriptions/webhook`
Validates payment provider webhooks (Razorpay / Cashfree) server-side with HMAC signature checks.

### `PUT /api/subscriptions/plans/{plan_code}`
Admin-only endpoint to update plan pricing proposals and features.

### `GET /api/revenue/metrics`
Returns financial metrics (MRR, ARR, active paying partners, ARPU, churn) strictly isolated in INR, never conflated with food kg.
