# UNION FOOD BRIDGE — COMPREHENSIVE PROJECT AUDIT (PHASE 0)
**Audit Date:** October 31, 2026  
**Audited Repository:** `NinjaCodeGirl/Union_FoodBridge`  
**Live Production URL:** https://union-food-bridge.vercel.app/  
**Workspace:** `C:\Users\yogit\OneDrive\Desktop\UNION`  
**Git Checkpoint:** Branch `upgrade/phase0-audit-and-redesign` (Baseline commit: `checkpoint: baseline existing codebase before audit and upgrades`)

---

## 1. EXECUTIVE SUMMARY

UNION FOOD BRIDGE is an AI-powered surplus food redistribution ecosystem designed to connect commercial food donors (restaurants, caterers, banquet halls, hotels) with verified recipient organizations (NGOs, community kitchens, shelters) and delivery volunteers.

The audit reveals a project with **strong architectural concepts** (FastAPI backend, Gemini AI freshness scoring, cryptographic QR verification handshakes, Haversine-based proximity matching, and B2B SaaS subscription economics). However, there is a **critical disconnect between the frontend presentation and backend reality**:
- **Authentication is completely absent**: Any visitor can toggle between `DONOR`, `NGO`, `VOLUNTEER`, and `ADMIN` roles through an unauthenticated client-side `<select>` dropdown.
- **There is no public-facing Landing Page**: Visitors are dropped straight into an internal donor dashboard with pre-filled mock data for "Taj Palace Banquet Kitchen".
- **Visual Design Fragmentation**: An older dark-green theme (`glass-panel`, `#111711`, `#1f2b1f` in `SurplusFeed.jsx`, `LiveMap.jsx`, `Leaderboard.jsx`) conflicts directly with a newer light-neutral theme (`#F8FAF9`, `#065F46`, `#FFFFFF` in `DonorDashboard.jsx`, `DonationWizard.jsx`, `PricingPage.jsx`), and neither follows the required **vibrant orange & dark navy/black SaaS branding**.
- **Data Persistence Gap**: The FastAPI backend stores surplus listings in an ephemeral in-memory Python list (`SURPLUS_DB = [...]`) that resets whenever the server restarts. The frontend relies heavily on `localStorage` fallback caches (`foodbridge_listings_v2`, `foodbridge_metrics_v2`).
- **Feature Placeholders**: WhatsApp alerts, camera-based QR scanning, and live volunteer GPS tracking exist only as UI labels or simulation modals rather than functional end-to-end features.

---

## 2. SYSTEM ARCHITECTURE & CODEBASE TOPOLOGY

```
UNION/
├── api/
│   └── index.py                     # Vercel serverless gateway importing backend.app.main
├── backend/
│   ├── app/
│   │   ├── config.py                # Pydantic Settings (Secrets, URLs, Gemini, Supabase)
│   │   ├── main.py                  # FastAPI instantiation, CORS, 8 router inclusions
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic data schemas (Donations, QR, Matching, SaaS)
│   │   ├── routers/
│   │   │   ├── analytics.py         # Impact stats & leaderboard endpoints
│   │   │   ├── calls.py             # Ola-style contact call logger
│   │   │   ├── donations.py         # Listing creation & active feed query
│   │   │   ├── ngo.py               # Matching & registered NGO registry
│   │   │   ├── qr.py                # Handshake token creation & verification
│   │   │   ├── ratings.py           # Trust ratings submission & retrieval
│   │   │   ├── revenue.py           # Platform SaaS revenue analytics
│   │   │   └── subscriptions.py     # Plan tiers, checkout simulator & invoices
│   │   └── services/
│   │       ├── call_service.py      # Call persistence (In-memory + Supabase client)
│   │       ├── freshness_ai.py      # Gemini AI / thermal decay shelf-life engine
│   │       ├── impact_tracker.py    # CO2 avoidance & rescued meals counter
│   │       ├── matching_engine.py   # Haversine distance & multi-NGO batch splitter
│   │       ├── qr_service.py        # PyJWT cryptographic token & QR image generator
│   │       ├── rating_service.py    # Trust score aggregation
│   │       ├── revenue_service.py   # MRR, ARR, churn, and enterprise ARR models
│   │       └── subscription_service.py # Tier entitlements & sandbox checkout
│   ├── requirements.txt             # Python backend dependencies
│   └── .env                         # Backend environment variables
├── database/
│   └── schema.sql                   # PostgreSQL (Supabase) 8-table relational schema
├── frontend/                        # Mirror copy of client (redundant build folder)
│   ├── package.json
│   └── src/
├── src/                             # ACTIVE Vite + React Frontend Root
│   ├── components/
│   │   ├── compliance/              # ComplianceRecords.jsx (FSSAI audit ledger)
│   │   ├── donor/                   # DonationWizard.jsx (4-step wizard), DonorDashboard.jsx
│   │   ├── layout/                  # AppShell.jsx (Desktop sidebar + TopNav + MobileNav)
│   │   ├── navigation/              # Sidebar.jsx, TopNavbar.jsx, MobileBottomNav.jsx, ResponsiveDrawer.jsx
│   │   ├── pricing/                 # PricingPage.jsx (4 tiers, checkout modal, FAQ)
│   │   ├── revenue/                 # AdminRevenueDashboard.jsx, UnitEconomicsDashboard.jsx
│   │   ├── subscription/            # SubscriptionManager.jsx (Tier governor & billing)
│   │   ├── ui/                      # 13 reusable UI atom components
│   │   ├── ContactSharingModal.jsx  # Ola-style direct call coordination modal
│   │   ├── Dashboard.jsx            # Generic impact overview dashboard
│   │   ├── DonationForm.jsx         # Legacy monolithic donation form
│   │   ├── Leaderboard.jsx          # Civic trust & impact leaderboard
│   │   ├── LiveMap.jsx              # Leaflet map with listing & NGO pins
│   │   ├── Navbar.jsx               # Legacy standalone navbar
│   │   ├── OnboardingModal.jsx      # 3-step platform introduction dialog
│   │   ├── QRModal.jsx              # QR token display & simulate scan modal
│   │   ├── RatingModal.jsx          # 5-star hygiene & punctuality evaluation
│   │   ├── SurplusFeed.jsx          # Recipient browse & filter feed
│   │   └── VoiceAssistant.jsx       # Browser Web Speech API assistant
│   ├── App.jsx                      # Main application orchestrator & local state manager
│   ├── index.css                    # Tailwind CSS directives & custom utility classes
│   └── main.jsx                     # React 18 DOM mount point
├── index.html                       # HTML entry point with Leaflet & font CDNs
├── package.json                     # Frontend npm dependencies (React 18, Leaflet, Lucide)
├── tailwind.config.js               # Tailwind design tokens
├── vercel.json                      # Vercel deployment rewrite rules
└── requirements.txt                 # Root Python requirements mirror
```

---

## 3. DATABASE SCHEMA & PERSISTENCE AUDIT

### 3.1 Relational Schema (`database/schema.sql`)
The PostgreSQL schema defines eight well-structured tables:
1. `users`: Stores user identity, authentication metadata, role (`RESTAURANT`, `NGO`, `COURIER`, `ADMIN`), and trust score.
2. `organizations`: Stores physical premises, geo-coordinates (`latitude`, `longitude`), storage type (`COLD_STORAGE`, `AMBIENT`, `HOT_HOLDING`), and daily capacity.
3. `surplus_listings`: Stores food title, category, quantity, weight, preparation time, storage condition, AI freshness score, validation SHA-256 hash, and status (`AVAILABLE`, `MATCHED`, `IN_TRANSIT`, `COMPLETED`, `EXPIRED`).
4. `allocations`: Records batch split results, linking a listing to recipient NGOs with allocated servings, distance, and transit time.
5. `call_logs`: Audit trail of donor-recipient phone calls.
6. `handshakes`: Cryptographic verification ledger containing JWT tokens, donor/recipient signatures, and CO2 mitigation figures.
7. `trust_ratings`: 1-5 star hygiene, punctuality, and overall ratings.
8. `impact_logs`: Global aggregate counters for rescued meals, avoided CO2, and saved tonnage.

### 3.2 In-Memory vs Database Persistence Disconnect
Despite having a comprehensive SQL schema:
- **`donations.py` does not connect to Supabase**: Listings are stored in a global Python list variable `SURPLUS_DB = [...]`. If the backend restarts or serverless execution contexts recycle, all newly created listings are erased.
- **Frontend Fallback Loop**: Because the live backend is either not running locally or disconnected in production, `App.jsx` falls back to `localStorage.getItem('foodbridge_listings_v2')`.
- **`call_service.py` has optional Supabase**: It initializes a Supabase client if `SUPABASE_URL` is set, but falls back to `CALL_LOGS_DB` in-memory list on failure.

---

## 4. API & ROUTE DEPENDENCY AUDIT

| Router Prefix | Primary Endpoints | Backend File | Status | Notes |
|---|---|---|---|---|
| `/api/donations` | `POST /create`<br>`GET /active` | `donations.py` | Partially Working | Validates AI freshness score threshold (>20.0). Stores to in-memory list only. |
| `/api/matching` | `POST /allocate`<br>`GET /registered-ngos` | `ngo.py`<br>`matching_engine.py` | Fully Working (Algorithmic) | Haversine distance scoring & cold chain category B matching work mathematically. Allocations are not persisted to database. |
| `/api/qr` | `POST /generate`<br>`POST /verify` | `qr.py`<br>`qr_service.py` | Fully Working | Generates HS256 JWT tokens & QR PNG Base64 images. Verification calculates CO2 mitigation. |
| `/api/analytics` | `GET /impact`<br>`GET /leaderboard` | `analytics.py`<br>`impact_tracker.py` | Fully Working | Returns live impact totals and top donors/NGOs. In-memory counters increment on QR verification. |
| `/api/calls` | `POST /log`<br>`GET /history` | `calls.py`<br>`call_service.py` | Fully Working | Logs caller role, timestamp, duration, and coordinates. |
| `/api/ratings` | `POST /submit`<br>`GET /history` | `ratings.py`<br>`rating_service.py` | Fully Working | Accepts hygiene and punctuality reviews and calculates updated trust scores. |
| `/api/subscriptions` | `GET /plans`<br>`GET /current`<br>`POST /sandbox-checkout`<br>`GET /invoices`<br>`GET /check-entitlement` | `subscriptions.py`<br>`subscription_service.py` | Fully Working | Complete simulated SaaS subscription management with 4 plans, GST invoice generator, and feature entitlement checker. |
| `/api/revenue` | `GET /metrics`<br>`GET /unit-economics` | `revenue.py`<br>`revenue_service.py` | Fully Working | Comprehensive B2B revenue projections (MRR, ARR, payback period, CAC/LTV). |

---

## 5. AUTHENTICATION & ACCESS CONTROL AUDIT

### 5.1 Current Implementation (Critical Flaw)
- There is **no authentication backend**: no `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, or `/api/auth/me` routes exist in the FastAPI backend.
- Role management is purely cosmetic: in `TopNavbar.jsx`, an HTML `<select>` allows any client to switch between `DONOR`, `NGO`, `VOLUNTEER`, and `ADMIN`.
- Changing roles simply switches which sidebar links and dashboard views render on screen.
- Private records (e.g. Admin Revenue Dashboard, confidential donor listings, volunteer dispatch data) are not guarded by authorization tokens.
- No role-specific onboarding data is collected (FSSAI registration for restaurants, NGO Darpan / 80G registration for shelters, vehicle details for volunteers).

---

## 6. INTEGRATION STATUS AUDIT

### 6.1 Gemini AI Freshness Engine (`backend/app/services/freshness_ai.py`)
- **Strengths**: Combines physical temperature-time decay formulas with base shelf-lives for 5 categories (`COOKED_MEALS`, `BAKERY`, `PRODUCE`, `PACKAGED`, `DAIRY`) and multipliers for storage (`REFRIGERATED`, `HEATED`, `ROOM_TEMP`). Generates a deterministic SHA-256 validation hash.
- **Flaws**:
  1. Relies on deprecated model candidate names: `gemini-1.5-flash-latest`, `gemini-1.5-flash`, `gemini-pro`.
  2. Does not accept an uploaded food image for multimodal visual inspection (only text food title).
  3. When the Gemini API call times out or fails, it falls back to a deterministic calculation without clear user feedback explaining the safety rationale.

### 6.2 Proximity & Leaflet Maps (`src/components/LiveMap.jsx`)
- **Strengths**: Uses `react-leaflet` with OpenStreetMap tiles. Displays custom styled map markers with category badges and popups for donations and registered NGOs.
- **Flaws**:
  1. The component styling is frozen in a legacy dark-green theme (`glass-panel`, `#1f2b1f`, `text-white`), clashing with the light SaaS layout.
  2. **Radius-based search is completely missing**: There is no slider or radius selector (e.g., 5 km, 10 km, 25 km) to filter pins or feed listings.
  3. User's live GPS location is not acquired or displayed on the map.

### 6.3 QR Verification & Handshake (`src/components/QRModal.jsx`)
- **Strengths**: Generates valid HS256 JWT tokens containing `handshake_id`, `allocation_id`, `donor_id`, `servings`, and expiry. Produces Base64 QR code images and verifies tokens via `/api/qr/verify`. Confetti animation triggers on success.
- **Flaws**:
  1. The frontend modal only offers a button labeled "Simulate NGO Pickup QR Scan".
  2. There is no real HTML5 camera scanner (using `html5-qrcode` or WebRTC camera stream) for a volunteer or NGO to point their phone at a real physical QR code.
  3. No fallback 6-digit OTP verification code is displayed for low-light or damaged camera situations.

### 6.4 WhatsApp Integration
- **Status: NOT IMPLEMENTED**.
- Mentioned repeatedly in copy text and pricing feature lists ("Instant WhatsApp & SMS operational alerts"), but zero code exists in either backend or frontend to trigger WhatsApp messages, send webhook alerts, or provide a click-to-WhatsApp (`wa.me`) coordination link.

---

## 7. SECURITY & VULNERABILITY AUDIT

1. **Exposed API Credentials**:
   - `backend/.env` and `frontend/.env` contain live API key strings (`GEMINI_API_KEY`, `DEEPGRAM_API_KEY`, `SUPABASE_KEY`).
   - Frontend `.env` exposes `VITE_GEMINI_API_KEY` and `VITE_SUPABASE_ANON_KEY`.
   - **Remediation**: Use environment variable interpolation; do not commit secrets to Git; route all AI evaluations through the backend proxy so frontend never touches raw Gemini or Supabase service keys.
2. **CORS Wildcard**:
   - `main.py` specifies `allow_origins=["*"]` with `allow_credentials=True`. This is insecure for production deployments with cookie-based sessions.
3. **Hardcoded Fallback JWT Secret**:
   - `backend/app/config.py` hardcodes `SECRET_KEY = "foodbridge-super-secret-key-2026"`.

---

## 8. MOBILE RESPONSIVENESS AUDIT

- **AppShell & Navigation**: `AppShell.jsx` has `MobileBottomNav.jsx` and `ResponsiveDrawer.jsx`. However, table views in `DonationTable.jsx` and `ComplianceRecords.jsx` have horizontal clipping on small screens (< 380px width).
- **Map Container**: `LiveMap.jsx` uses a fixed height of `h-[550px]` which overflows the viewport on mobile devices when bottom navigation is visible.
- **Touch Target Sizes**: Several action buttons in modal windows are smaller than the WCAG recommended 44x44px minimum touch target size.

---

## 9. CONCLUSION & IMMEDIATE ACTIONS

The core business logic (matching algorithms, JWT generation, SaaS models, compliance schema) is solid. The primary work required is:
1. Preserve all existing calculation engines, schemas, and routers.
2. Build the missing Landing Page and professional Orange & Dark Navy SaaS frontend.
3. Build a unified, persistent authentication and role-based access system with role-specific registrations (FSSAI, NGO capacity, volunteer transport).
4. Implement genuine interactive radius search, camera QR scanning, and direct WhatsApp dispatch links.
5. Provide bilingual (English + Hindi) support, guided workflows, and plain-language tooltips for full accessibility.
