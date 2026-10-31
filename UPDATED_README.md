# FoodBridge 🍲⚡
### AI-Powered Surplus Food Redistribution Ecosystem, Automatic NGO Escalation & Verification Ledger

[![Build with Bharat](https://img.shields.io/badge/Hackathon-Build%20With%20Bharat%202026-orange.svg)](https://github.com/NinjaCodeGirl/Union_FoodBridge)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TailwindCSS-61DAFB.svg)](https://reactjs.org)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%20Flash%20Multimodal-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20PostGIS-3ECF8E.svg)](https://supabase.com)
[![Test Suite](https://img.shields.io/badge/Tests-46%20Passed%20%7C%20100%25-brightgreen.svg)](backend/tests/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

FoodBridge is an enterprise-grade surplus food redistribution platform connecting restaurants, hotels, cloud kitchens, and verified NGOs/shelters with community courier volunteers. It provides server-enforced **Automatic NGO Escalation & Reallocation**, **Live Rapid Pickup Tracking with Dynamic ETAs**, **Multi-Recipient Batch Splitting with Zero Overbooking**, **Separate Delivery vs. Distribution Proofs**, **B2B SaaS Pricing with HMAC Webhooks**, and a **Consolidated 4-Role Dashboard Architecture**.

---

## 🏛️ System Architecture

```
                    Surplus Donors (Restaurants / Hotels / Caterers)
                                          │
                                          ▼
                         React 18 + Tailwind CSS SPA
          (Consolidated 4 Role Dashboards • Leaflet Maps • Live Dispatch)
                                          │
                                REST API (Bearer JWT)
                                          │
                                          ▼
                              FastAPI + Uvicorn Server
           (PBKDF2 Auth • Role RBAC • Allocation & Escalation Engine)
                                          │
       ┌───────────────────┬──────────────┴──────────────┬───────────────────┐
       │                   │                             │                   │
       ▼                   ▼                             ▼                   ▼
  Gemini AI        Automatic Escalation           Evidence Vault       Live Telemetry
 Multimodal          & Matching Engine          (SHA-256 Storage)     & Dispatch Engine
       │                   │                             │                   │
  ├ Freshness Score   ├ Priority-Ranked NGOs        ├ Multipart Binary  ├ Real-Time Coordinates
  ├ Category A/B      ├ 5-Minute Timeout Window     ├ Server Checksum   ├ Dynamic Travel ETA
  ├ Shelf-Life Hours  ├ Partial Claim Splitting     ├ Ingest Isolation  ├ Transparent Late Policy
  └ Thermal Curves    └ In-Transit Lock             └ Distribution Proof└ <250m Proximity Check
       │                   │                             │                   │
       └───────────────────┴──────────────┬──────────────┴───────────────────┘
                                          │
                                          ▼
                            Distribution & Witness Ledger
                   (Portions Distributed • Independent 3rd-Party Attestation)
                                          │
                                          ▼
                            Admin Governance & Audit Gate
                      (RBAC Strict Verification • Audit Log Closure)
```

---

## 🔑 Pre-Seeded Demonstration Personas

All personas share the standard development password: **`FoodBridge@2026!`**

| Persona | Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **The Grand Palace** | `DONOR` / `RESTAURANT` | `taj@foodbridge.org` | `FoodBridge@2026!` | List surplus food, multimodal AI freshness check, approve pickups with prep times, manage B2B SaaS subscription. |
| **Akshaya Patra Delhi** | `NGO` / `RECIPIENT` | `akshaya@foodbridge.org` | `FoodBridge@2026!` | Real-time 5-minute countdown offers, accept full/partial portions, log distribution sessions, submit witness proofs. |
| **Arjun Sharma** | `VOLUNTEER` | `arjun@foodbridge.org` | `FoodBridge@2026!` | Accept rapid pickups, live GPS proximity check (<250m), report standardized delays, verify handoff QR/OTP. |
| **System Governance Admin** | `ADMIN` | `admin@foodbridge.org` | `FoodBridge@2026!` | Platform governance, NGO escalation engine monitor, B2B SaaS revenue analytics, fraud monitor, audit distribution events. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher (Tested on Python 3.14 x64)
- **Git**

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1
# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Interactive OpenAPI documentation will be accessible at: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup (React 18 + Vite)

```bash
# Navigate to repository root (where package.json is located)
cd ..

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The web application will be accessible at: **`http://localhost:5173`**

To build for production:
```bash
npm run build
```

---

### 3. Running Automated End-to-End Tests

The test suite contains **46 automated tests** covering Phases 0–8 and all 6 core scenario flows:

```bash
# Windows (PowerShell):
& "C:\Users\yogit\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m unittest discover -s backend/tests -p "test_*.py" -v

# Linux / macOS:
PYTHONPATH=backend python3 -m unittest discover -s backend/tests -p "test_*.py" -v
```

---

## 📡 Complete REST API Reference

### 1. Authentication & RBAC (`/api/auth`)
- `POST /api/auth/register`: Register new user with PBKDF2 password hashing and compliance IDs.
- `POST /api/auth/login`: Authenticate email/password; returns signed JWT Bearer token and role.
- `GET /api/auth/me`: Retrieve profile of currently authenticated user using Bearer token.

### 2. Automatic NGO Escalation & Reallocation (`/api/escalation`)
- `POST /api/escalation/create-offer`: Dispatch initial priority food offer to top-ranked NGO with 5-minute countdown window.
- `POST /api/escalation/respond`: NGO accepts (full or partial), rejects, or requests time extension. Unaccepted remainder is automatically reallocated.
- `GET /api/escalation/my-offers`: Query active pending offers for a specific NGO.
- `POST /api/escalation/check-escalations`: Trigger evaluation cycle to detect expired offers and reallocate down the priority chain.
- `GET /api/escalation/history/{listing_id}`: Full audit trail of dispatched, expired, and reallocated offers.

### 3. Rapid Pickup & Live Telemetry (`/api/deliveries`)
- `POST /api/deliveries/request`: NGO requests food with atomic stock reservation.
- `POST /api/deliveries/approve`: Restaurant approves request with kitchen preparation minutes.
- `POST /api/deliveries/assign`: Dispatch volunteer with vehicle and GPS telemetry.
- `POST /api/deliveries/accept`: Volunteer accepts assignment; system calculates realistic travel ETA.
- `POST /api/deliveries/location-ping`: Courier updates live GPS coordinates, dynamically recalculating ETA.
- `POST /api/deliveries/report-delay`: Report standardized delay (Traffic, Vehicle, Kitchen, Weather, GPS, Other).
- `POST /api/deliveries/arrive`: Verify GPS proximity arrival (<250m from kitchen dock).
- `GET /api/deliveries/{delivery_id}/status`: Live pickup status, ETA countdown, and transparent late policy.

### 4. Surplus Food & AI Freshness (`/api/donations`)
- `POST /api/donations/create`: Create surplus food listing with Category A/B classification.
- `POST /api/donations/ai-screen`: Multimodal visual AI screening calculating decay factor and remaining safe window.
- `GET /api/donations/active`: Query active surplus listings.
- `GET /api/donations/security-report`: Aggregated food security metrics and CO₂ mitigation.
- `GET /api/donations/{listing_id}/reconciliation`: Mathematical reconciliation verifying `Total == Available + Reserved + In-Transit + Delivered`.

### 5. Multi-Recipient Smart Matching (`/api/matching`)
- `POST /api/matching/allocate`: Split high-volume surplus batches across up to 3 recipients without overbooking.

### 6. Distribution Center & Witness Ledger (`/api/distribution`)
- `POST /api/distribution/create-event`: NGO registers intake event for received surplus portions.
- `POST /api/distribution/record-session`: Record actual beneficiary meal distribution (photos, count, leftover balance).
- `POST /api/distribution/witness-verify`: Independent 3rd-party witness attestation with anti-self-witnessing check.
- `POST /api/distribution/admin-audit`: Admin governance audit decision (`VERIFIED`, `REJECTED`, `DISPUTED`).
- `GET /api/distribution/events`: Query distribution events by NGO.
- `GET /api/distribution/audit-summary`: Platform compliance audit metrics for Admin console.

### 7. Multipart Evidence Vault (`/api/evidence`)
- `POST /api/evidence/upload`: Binary upload (JPEG, PNG, MP4); server computes SHA-256 hash and persists file.
- `GET /uploads/{filename}`: Static server route for validated evidence artifacts.

### 8. TrustChain QR & OTP Security (`/api/qr`)
- `POST /api/qr/generate`: Generate cryptographically signed, expiring QR token with HMAC-SHA256.
- `POST /api/qr/verify`: Redeem pickup QR token with anti-replay tracking (`CONSUMED_TOKENS`).
- `POST /api/qr/verify-otp`: Redeem single-use 6-digit offline emergency OTP.

### 9. Multi-Role Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieve in-app notification ledger filtered by role and user ID.
- `POST /api/notifications/{id}/read`: Mark notification as read.
- `POST /api/notifications/read-all`: Bulk mark all unread notifications.

### 10. B2B SaaS Subscriptions & Webhooks (`/api/subscriptions`)
- `GET /api/subscriptions/tiers`: List all 4 subscription tiers and feature entitlements.
- `POST /api/subscriptions/checkout`: Checkout upgrade simulation issuing invoices.
- `POST /api/subscriptions/webhook`: Razorpay/Stripe webhook endpoint with HMAC signature verification.
- `POST /api/subscriptions/admin/update-price`: Admin plan price proposal updates.

### 11. B2B SaaS Financial Revenue (`/api/revenue`)
- `GET /api/revenue/analytics`: Financial MRR, ARR, and gross margins strictly separated from food weight (kg).
- `GET /api/revenue/unit-economics`: Unit economics simulator calculating logistics costs and platform margin.

---

## 🎨 Consolidated 4-Role Dashboard Architecture

To eliminate fragmented standalone screens and maintain a unified user experience, all platform functionality is organized into **strictly four primary role dashboards**:

1. **Restaurant / Surplus Partner Dashboard (`DonorDashboard.jsx`)**:
   - Live food inventory & batch status
   - Multimodal AI freshness inspection wizard
   - Active pickup tracking with live courier telemetry & delay alerts
   - Reusable `WeeklyActivitySection` (Sunday–Saturday portions histogram)
   - Reusable `UnifiedLeaderboardSection` (Restaurant, NGO, Courier 3-way toggle)
   - B2B SaaS Subscription Manager & FSSAI regulatory compliance
2. **NGO / Recipient Dashboard (`RecipientDashboard.jsx`)**:
   - Interactive OpenStreetMap proximity map with radius filtering
   - **NGO Priority Offers Tab**: Real-time 5-minute countdown clock, Accept Full, Accept Partial, Reject, or Request Time Extension
   - NGO Distribution Centre: Beneficiary count, meal photos, leftover balance, and independent witness attestation
   - Embedded Community Leaderboard & Weekly Intake Activity
3. **Volunteer / Courier Dashboard (`VolunteerDashboard.jsx`)**:
   - Real-time rapid dispatch missions with dynamic ETA countdowns
   - GPS proximity arrival verification button (<250m)
   - Standardized delay reporting modal with automatic kitchen broadcasts
   - Handoff QR scanner and single-use 6-digit OTP verification
   - Weekly courier activity charts & courier leaderboard ranking
4. **Platform Admin Governance Hub (`AdminDashboard.jsx`)**:
   - FSSAI 14-digit kitchen license and NGO 80G legal verification queue
   - **NGO Escalation Engine Monitor**: Real-time reservation queue, timeout monitors, and force-evaluation controls
   - B2B SaaS MRR/ARR financial analytics & Unit Economics Simulator
   - Safety & fraud alarms (duplicate QR scans, cold chain temperature violations)
   - Distribution audit ledger & platform community leaderboard

---

## 🛡️ Security Architecture & Integrity

1. **PBKDF2 Password Protection**: Passwords hashed using PBKDF2-HMAC-SHA256 with 100,000 iterations and cryptographic random salt.
2. **Server-Enforced RBAC**: Protected routes verify JWT `role` claims server-side; client manipulation cannot bypass administrative gates.
3. **Anti-Replay QR Tokens**: Redeemed QR tokens are permanently revoked and cannot be double-spent.
4. **Single-Use Offline OTP**: 6-digit emergency OTPs expire immediately upon initial redemption.
5. **Cumulative Portion Reconciliation**: Mathematical ledger guarantees `Total Listed == Available + Reserved + In-Transit + Delivered`.
6. **Anti-Self-Witnessing**: Strict identity matching prevents distribution agencies or coordinators from signing their own witness records.
7. **Multipart Binary SHA-256**: Uploaded photos and videos are hashed at the byte level on the server, generating immutable audit trails.
8. **In-Transit Lock**: Reallocation engine strictly blocks food from being reallocated if a courier is actively en route.
9. **Webhook HMAC Signatures**: External payment events verify HMAC-SHA256 signatures before provisioning plan entitlements.

---

## 🌿 Environmental Impact Model

FoodBridge quantifies carbon offset based on scientific municipal solid waste emission factors:
$$\text{CO}_2 \text{ Mitigation (kg)} = \text{Rescued Meals} \times 2.5\text{ kg}$$

Every verified distribution automatically updates real-time impact dashboards and generates downloadable digital certificates.

---

## 👥 Team UNION (Netaji Subhas University of Technology)

- **Yogita Chourasia** - *Team Lead & AI Integration*
- **Sayesha Varshney** - *Full-Stack Lead & Cloud Architecture*
- **Mohd Kashif Farhan** - *Backend API & Matching Algorithms*
- **Suraj Sah** - *Frontend UI/UX & Verification Ledger*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

