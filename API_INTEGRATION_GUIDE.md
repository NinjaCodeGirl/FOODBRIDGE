# UNION FOOD BRIDGE — External API Integration & Security Guide

**Document Version**: 2.0.0  
**Target Architecture**: FastAPI + React 18 + Supabase / PostgreSQL  
**Audit Status**: Verified Clean, Zero Hardcoded Secrets

---

## 1. Integration Matrix & Operational Status

| Integration Domain | Official Provider | Operational Status | Fallback Mechanism | Configuration Variable |
|--------------------|-------------------|:------------------:|--------------------|------------------------|
| **AI Freshness & Screening** | Google Gemini Vision (1.5 Flash) | **Active / Graceful Fallback** | Deterministic Thermodynamic Arrhenius Decay Model | `GEMINI_API_KEY` |
| **Maps & Routing** | OpenStreetMap / Leaflet | **Active (Live)** | Haversine Spherical Distance Matrix + Urban Traffic Index | `VITE_MAP_TILES_URL` |
| **Evidence Media Storage** | Server Static Disk Storage | **Active (Live)** | In-Memory Streaming with SHA-256 Checksum | `UPLOADS_DIR` |
| **Operational Messaging** | WhatsApp Web / Deep Links | **Active (Live Direct)** | Client-side `wa.me` deep linking with cryptographic tracking URLs | Direct URL encoding |
| **In-App Notifications** | FoodBridge Lifecycle Ledger | **Active (Live)** | Polling & Webhook Dispatch Across 10 Lifecycle Stages | Built-in |
| **Payment Gateway** | Razorpay / Cashfree (Sandbox) | **Active (Verified Sandbox)** | Cryptographic HMAC-SHA256 Signature Validator | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| **User Authentication** | PBKDF2-HMAC-SHA256 & JWT | **Active (Live)** | Rate-limited login (5 attempts / 5 mins) | `SECRET_KEY`, `ALGORITHM` |

---

## 2. Detailed Integration Specifications

### 🤖 1. Google Gemini Multimodal Freshness AI
- **Provider**: Google DeepMind / Google AI Studio (`google.generativeai` / `google.genai`).
- **Purpose**: Non-invasive visual container/food screening, category identification, visible spoilage flags, thermodynamic decay factor.
- **Required Credentials**: `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Setup Instructions**:
  1. Generate an API key from Google AI Studio.
  2. Add `GEMINI_API_KEY=AIzaSy...` to your `backend/.env` file.
- **Test Procedure**:
  Run `python -m unittest backend/tests/test_e2e_lifecycle.py -k test_07_ai_screening_endpoint`.
- **Honest Status**:
  When `GEMINI_API_KEY` is not provided or upstream model endpoints are unavailable, the system automatically falls back to thermodynamic decay calculations with clear `ai_source="DETERMINISTIC_HEURISTIC"` attribution. Image scores are never presented as statutory FSSAI lab certificates.

---

### 🗺️ 2. Maps, Geocoding & Route Telemetry
- **Provider**: OpenStreetMap & React Leaflet (with Haversine matrix).
- **Purpose**: Donor/NGO coordinate placement, proximity radius filtering (1 km, 2 km, 5 km, 10 km, 15 km, 25 km), courier route polylines, 250m geofence proximity detection.
- **Required Credentials**: None required for OpenStreetMap tile layers. Optional Mapbox or Azure Maps keys for traffic overlays.
- **Setup Instructions**:
  1. Tiles load automatically from `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
  2. Geolocation permissions are requested via the HTML5 Geolocation API with graceful fallback to Delhi NCR NSUT center coordinates (`28.6100, 77.0500`).
- **Test Procedure**:
  Run `python -m unittest backend/tests/test_phases_5_to_8.py -k test_28_gps_proximity_arrival_verification`.

---

### 🗄️ 3. Evidence Media Vault & Tamper-Proof Storage
- **Provider**: Local Disk Storage (`backend/uploads/`) with chunked SHA-256 calculation.
- **Purpose**: Persisting food listing photos, courier pickup evidence, delivery receipts, and NGO distribution proof videos.
- **Security Validations**:
  - Max file size: 25 MB.
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`.
  - Disallowed types (e.g. `.exe`, `.bat`) rejected with `400 Bad Request`.
  - File name sanitization prevents directory traversal attacks.
- **Test Procedure**:
  Run `python -m unittest backend/tests/test_e2e_lifecycle.py -k test_11_evidence_upload_with_sha256`.

---

### 💬 4. WhatsApp Operational Notifications
- **Provider**: WhatsApp Web & Universal Deep Linking (`wa.me`).
- **Purpose**: Instant click-to-chat operational alerts and tracking links for 10 platform lifecycle events.
- **Honest Declaration**:
  FoodBridge uses pre-formatted direct links with cryptographic tracking URLs. The system does not falsely claim a message was "delivered via cloud API" if the user only clicked a share link.

---

### 💳 5. B2B SaaS Subscriptions & Billing
- **Provider**: Razorpay / Cashfree simulated sandbox.
- **Purpose**: Commercial partner subscription upgrades (Food Partner Pro at ₹999/mo, Business Plus at ₹2,999/mo, Enterprise & CSR custom).
- **Free Guarantee**: Essential food redistribution, listing, claiming, and handshakes are **100% free forever** for verified NGOs and shelters.
- **Webhook Security**: Webhooks validate HMAC-SHA256 signatures server-side.

---

## 3. API Key Security & Storage Rules

1. **Zero Hardcoded Secrets**: All keys, passwords, and tokens are read exclusively through environment variables (`backend/app/config.py`).
2. **Git Integrity**: `.env` and secret files are permanently excluded via `.gitignore`.
3. **No Private Keys in Frontend**: Client bundles contain only public endpoints (`VITE_API_URL`).
4. **No Secrets in LocalStorage**: User passwords and API keys are never stored in client browser storage.

