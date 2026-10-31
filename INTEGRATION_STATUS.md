# UNION FOOD BRIDGE — Live Integration Status & Audit Log

**Audit Timestamp**: October 31, 2026  
**Auditor**: Senior Systems Architect & Lead Engineer  
**Policy**: Absolute honesty — no simulated feature is falsely claimed as an enterprise cloud integration.

---

## 1. Integration Status Matrix

| Module | Integration | Configuration Required | Real Implementation Details | Verification Test | Status |
|--------|-------------|:----------------------:|-----------------------------|:-----------------:|:------:|
| **Authentication** | PBKDF2 + JWT | `SECRET_KEY` | Salted PBKDF2-HMAC-SHA256 password hashing (100,000 iterations); signed HS256 JWT access tokens; rate limiter (5 failed attempts per 5 mins). | `test_01`, `test_02`, `test_05` | **LIVE & ACTIVE** |
| **AI Freshness** | Google Gemini 1.5 Flash | `GEMINI_API_KEY` | Multimodal visual inspection endpoint. When API key is absent or endpoints return 404, cleanly falls back to calibrated thermodynamic Arrhenius decay model with explicit `ai_source` transparency. | `test_07` | **LIVE WITH FALLBACK** |
| **Maps & Routing** | OpenStreetMap / Leaflet | None (Public tiles) | Interactive map rendered via OpenStreetMap raster tiles. Distance matrix computed via spherical Haversine formula with urban speed factors (25-30 km/h). | `test_28` | **LIVE & ACTIVE** |
| **Evidence Storage** | Local Disk Storage | `UPLOADS_DIR` | Binary multipart stream uploaded directly to `backend/uploads/` with server-side SHA-256 chunked calculation and MIME sanitization. | `test_11`, `test_12` | **LIVE & ACTIVE** |
| **WhatsApp Alerts** | Web Universal Links | Client-side | Formats honest `https://wa.me/{phone}?text={encoded}` operational links with cryptographic tracking URLs. Clearly distinguished from background API webhook delivery. | Verified in browser | **LIVE DIRECT** |
| **In-App Notifications** | Central Ledger | Built-in | Dispatches, tracks, and reads unread notifications across 10 lifecycle events. Accessible via REST endpoints and top navigation drawer. | `test_35` | **LIVE & ACTIVE** |
| **B2B SaaS Payments** | Razorpay / Cashfree | `RAZORPAY_KEY_ID` | Operates in verified sandbox mode with server-side HMAC-SHA256 signature verification and invoice PDF download generation. Community Free plan is permanently ₹0 for NGOs. | `test_37`, `test_38` | **VERIFIED SANDBOX** |
| **NGO Escalation** | Timezone Server Engine | Built-in | Server-side 5-minute countdowns with automated timeout detection and re-allocation to next ranked NGO. | `test_21`, `test_31` | **LIVE & ACTIVE** |
| **Distribution Proof** | Witness & Evidence Ledger | Built-in | Reconciles portions received vs. distributed. Enforces independent witness verification with bidirectional anti-self-witnessing check. | `test_14`, `test_16`, `test_17` | **LIVE & ACTIVE** |

---

## 2. API Credentials Setup Instructions

To activate upstream production keys:
1. **Google Gemini**: Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and set `GEMINI_API_KEY=...` in `backend/.env`.
2. **Supabase PostgreSQL**: Create a project on [Supabase](https://supabase.com) and set `DATABASE_URL=postgresql://...` in `backend/.env`. Run `database/schema.sql`.
3. **Razorpay Live Merchant**: After completing merchant KYC, update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

