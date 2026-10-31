# FoodBridge 🍲⚡
### AI-Powered Surplus Food Redistribution Ecosystem & Verification Ledger

[![Build with Bharat](https://img.shields.io/badge/Hackathon-Build%20With%20Bharat%202026-orange.svg)](https://github.com/NinjaCodeGirl/Union_FoodBridge)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TailwindCSS-61DAFB.svg)](https://reactjs.org)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%20Flash%20Multimodal-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-3ECF8E.svg)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

FoodBridge is an enterprise-grade surplus food redistribution platform connecting restaurants, hotels, cloud kitchens, and verified NGOs/shelters with community volunteers. It automates AI freshness evaluation, proximity-based batch splitting, cryptographic QR/OTP handshakes, physical evidence hashing, and transparent community distribution auditing.

---

## 🏛️ System Architecture

```
                    Surplus Donors (Restaurants / Hotels / Caterers)
                                          │
                                          ▼
                               React 18 + Tailwind CSS SPA
                    (Vite • Leaflet Maps • TrustChain Evidence Capture)
                                          │
                                 REST API (Bearer JWT)
                                          │
                                          ▼
                               FastAPI + Uvicorn Server
                     (PBKDF2 Auth • Role RBAC • Allocation Engine)
                                          │
        ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
        │                   │                           │                   │
        ▼                   ▼                           ▼                   ▼
   Gemini AI         OpenStreetMap /            Evidence Vault        TrustChain QR
  Multimodal         Leaflet Routing           (SHA-256 Storage)      & OTP Ledger
        │                   │                           │                   │
   ├ Freshness Score   ├ Proximity Radius          ├ Multipart Binary   ├ HMAC Anti-Replay
   ├ Hours Remaining   ├ Lat/Lng Distance          ├ Server Checksum    ├ 6-Digit Single-Use
   ├ Category A/B      ├ Route Travel ETA          ├ Disk Persist       ├ Role Enforcement
   └ Decay Factor      └ Nearest Clusters          └ Tamper Evidence    └ Chain Verification
        │                   │                           │                   │
        └───────────────────┴─────────────┬─────────────┴───────────────────┘
                                          │
                                          ▼
                              Distribution & Witness Ledger
                   (Cumulative Reconciliation • Anti-Self-Witnessing)
                                          │
                                          ▼
                            Admin Governance & Audit Gate
                      (RBAC Strict Verification • Audit Log)
```

---

## 🔑 Pre-Seeded Demonstration Personas

All personas share the standard development password: **`FoodBridge@2026!`**

| Persona | Role | Email | Password | Primary Capabilities |
|---------|------|-------|----------|----------------------|
| **The Grand Palace** | `RESTAURANT` | `taj@foodbridge.org` | `FoodBridge@2026!` | List surplus food, multimodal AI freshness check, generate pickup QR & OTP, view donor analytics. |
| **Akshaya Patra Delhi** | `RECIPIENT` | `akshaya@foodbridge.org` | `FoodBridge@2026!` | Browse surplus map within radius, claim batches, redeem QR codes, manage intake & distribution sessions. |
| **Arjun Sharma** | `VOLUNTEER` | `arjun@foodbridge.org` | `FoodBridge@2026!` | Accept rescue tasks, capture photo evidence with GPS, submit handoff QR/OTP, view delivery routes. |
| **System Governance Admin** | `ADMIN` | `admin@foodbridge.org` | `FoodBridge@2026!` | Enterprise governance, audit distribution records, inspect tamper-proof SHA-256 evidence, lock closed events. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher (Tested on Python 3.14)
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
# Copy template and update API keys as needed
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

---

### 3. Running Automated End-to-End Tests

The test suite validates the full 18-step donation lifecycle (100 meals listed $\to$ 60 claimed $\to$ pickup $\to$ delivery $\to$ distribution $\to$ witness $\to$ admin audit) plus 8 negative security attack vectors:

```bash
# From repository root:
# Windows (PowerShell):
$env:PYTHONPATH="backend"; python -m unittest backend/tests/test_e2e_lifecycle.py -v

# Linux / macOS:
PYTHONPATH=backend python3 -m unittest backend/tests/test_e2e_lifecycle.py -v
```

---

## 📡 REST API Reference

### Authentication & RBAC (`/api/auth`)
- `POST /api/auth/register`: Register new user with PBKDF2 password hashing and compliance IDs.
- `POST /api/auth/login`: Authenticate email/password; returns signed JWT Bearer token and role.
- `GET /api/auth/me`: Retrieve profile of currently authenticated user using Bearer token.

### Surplus Food & AI Freshness (`/api/donations`)
- `POST /api/donations/create`: Create surplus food listing with Category A/B classification.
- `POST /api/donations/ai-screen`: Multimodal visual AI screening calculating decay factor and remaining safe window.
- `GET /api/donations/active`: Query active surplus listings filtered by status and location.

### TrustChain Verification & Handshake (`/api/qr`)
- `POST /api/qr/generate`: Generate cryptographically signed, expiring QR token with HMAC-SHA256.
- `POST /api/qr/verify`: Redeem pickup QR token with anti-replay tracking (`CONSUMED_TOKENS`).
- `POST /api/qr/verify-otp`: Redeem single-use 6-digit offline emergency OTP.

### Multipart Evidence Vault (`/api/evidence`)
- `POST /api/evidence/upload`: Upload real image/video evidence binary; server calculates tamper-proof SHA-256 checksum and saves to `backend/uploads/`.
- `GET /uploads/{filename}`: Static server route for validated evidence artifacts.

### Distribution Centre & Witness Ledger (`/api/distribution`)
- `POST /api/distribution/intake`: NGO registers intake event for received surplus portions.
- `POST /api/distribution/record-session`: Record beneficiary meal distribution with cumulative reconciliation against ghost portions.
- `POST /api/distribution/verify-witness`: Independent 3rd-party witness verification with bidirectional anti-self-witnessing validation.
- `POST /api/distribution/admin-audit`: Admin-only audit lock enforcing RBAC (`ADMIN` role required).

---

## 🛡️ Security Architecture & Integrity

1. **PBKDF2 Password Protection**: Passwords hashed using PBKDF2-HMAC-SHA256 with 100,000 iterations and cryptographic random salt.
2. **Server-Enforced RBAC**: Protected routes verify JWT `role` claims server-side; client manipulation cannot bypass administrative gates.
3. **QR Anti-Replay Tokens**: Redeemed QR tokens are permanently marked and cannot be double-spent.
4. **Single-Use Offline OTP**: 6-digit emergency OTPs expire immediately upon initial redemption.
5. **Cumulative Portion Reconciliation**: Distribution center blocks multiple sessions from allocating more portions than physically received.
6. **Anti-Self-Witnessing**: Strict identity matching prevents distribution agencies or coordinators from signing their own witness records.
7. **Multipart Binary SHA-256**: Uploaded photos and videos are hashed at the byte level on the server, generating immutable audit trails.

---

## 🌿 Environmental Impact Model

FoodBridge quantifies carbon offset based on scientific municipal solid waste emission factors:
$$\text{CO}_2 \text{ Mitigation (kg)} = \text{Rescued Meals} \times 2.5\text{ kg}$$

Every verified distribution automatically reflects on real-time public impact dashboards and generates downloadable digital certificates.

---

## 👥 Team UNION (Netaji Subhas University of Technology)

- **Yogita Chourasia** - *Team Lead & AI Integration*
- **Sayesha Varshney** - *Full-Stack Lead & Cloud Architecture*
- **Mohd Kashif Farhan** - *Backend API & Matching Algorithms*
- **Suraj Sah** - *Frontend UI/UX & Verification Ledger*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
