# UNION FOOD BRIDGE — Production Deployment & Environment Guide

**Version**: 2.0.0 Enterprise  
**Live Production Web**: https://union-food-bridge.vercel.app/  
**Source Repository**: https://github.com/NinjaCodeGirl/Union_FoodBridge  
**Primary Deployment Strategy**: Vercel (Frontend SPA) + FastAPI Uvicorn ASGI Server (Backend)

---

## 1. Production Architecture Overview

Union Food Bridge operates as a decoupled cloud-native architecture:
- **Client Tier**: Single-Page Application built on React 18, Vite, and Tailwind CSS. Hosted on Vercel Edge Network with global CDN caching.
- **API & Application Gateway Tier**: ASGI REST API powered by FastAPI & Python 3.14. Handles PBKDF2 authentication, JWT issuance, route calculation, rapid pickup telemetry, and subscription billing.
- **Evidence Vault**: Binary static media storage with SHA-256 chunked calculation for tamper-proof delivery verification.
- **Database Tier**: PostgreSQL relational schema supporting PostGIS spatial coordinates, indexing on user roles, and compliance timestamps.
- **Messaging & Notifications**: Client-side direct WhatsApp deep linking with pre-formatted cryptographic tracking URLs, plus real-time in-app notification state.

---

## 2. Production Environment Variables

### Backend (`backend/.env`)
| Variable Name | Required | Default / Example Value | Description |
|---------------|:--------:|-------------------------|-------------|
| `APP_NAME` | Yes | `FoodBridge Universal Redistribution Network` | System identification name |
| `ENV` | Yes | `production` | Environment mode (`production`, `staging`, `development`) |
| `PORT` | Yes | `8000` | Port for ASGI Uvicorn listener |
| `SECRET_KEY` | **Yes** | `<cryptographic-random-64-char-hex>` | Secret key for JWT signing & HMAC SHA-256 token validation |
| `ALGORITHM` | Yes | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | `1440` | JWT expiration lifetime (24 hours) |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini API key for multimodal freshness inspection |
| `DATABASE_URL` | Optional | `postgresql://postgres:...@db.supabase.co:5432/postgres` | PostgreSQL connection URI |
| `UPLOADS_DIR` | Yes | `backend/uploads` | Path for persisted evidence media binaries |
| `CORS_ORIGINS` | Yes | `https://union-food-bridge.vercel.app,http://localhost:5173` | Allowed CORS origins |

### Frontend (`.env` or Vercel Environment Settings)
| Variable Name | Required | Default / Example Value | Description |
|---------------|:--------:|-------------------------|-------------|
| `VITE_API_BASE_URL` | Yes | `https://union-food-bridge.vercel.app/api` or `/api` | Base URL for API gateway requests |
| `VITE_APP_NAME` | Yes | `FoodBridge` | Application branding |
| `VITE_MAP_TILES_URL` | No | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Leaflet tile provider |

---

## 3. Database Migration & Schema Verification

The SQL schema is located at [`database/schema.sql`](file:///c:/Users/yogit/OneDrive/Desktop/UNION/database/schema.sql).

Execute the schema against your production PostgreSQL instance:
```bash
# Using psql:
psql -h <host> -U <user> -d <dbname> -f database/schema.sql
```
Verified tables and relations:
- `users`: Includes `password_hash`, `role`, `fssai_license`, `darpan_id`, `service_radius_km`, `mfa_enabled`.
- `surplus_listings`: Classification Category A/B, quantity, freshness score, validation hash.
- `delivery_records`: Telemetry, preparation window, travel time, deadline, late policy status, delay history.
- `distribution_events`: Beneficiary count, portion reconciliation, independent witness logs.
- `evidence_ledger`: File URL, SHA-256 hash, GPS coordinates, timestamp.
- `subscription_plans`: Entitlements, monthly/annual pricing in INR.
- `billing_invoices`: Invoices, GSTIN, status, download URL.

---

## 4. Production Build & Deployment Commands

### Frontend (Vercel)
```bash
# Build command configured in vercel.json:
npm run build

# Output directory:
dist
```

### Backend (Systemd / Docker / Cloud Run)
```bash
# Using Uvicorn with Gunicorn process manager:
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 5. Security & Operational Checklist

- [x] Passwords hashed using PBKDF2-HMAC-SHA256 with 100,000 iterations and per-user cryptographic salt.
- [x] JWT Bearer tokens enforced on protected endpoints (`/api/auth/me`, `/api/distribution/admin-audit`).
- [x] QR tokens protected by `CONSUMED_TOKENS` anti-replay set.
- [x] 6-digit emergency OTP single-use revocation verified.
- [x] Multipart evidence uploads compute server-side SHA-256 and reject dangerous MIME types.
- [x] Multi-session portion cumulative reconciliation blocks ghost inventory overallocation.
- [x] Bidirectional anti-self-witnessing check blocks collusive self-signatures.
- [x] GPS proximity arrival verifies courier is within 250m before allowing dock arrival status.
- [x] B2B SaaS payment webhooks enforce cryptographic signature verification.
- [x] Financial revenue metrics (INR) strictly segregated from food quantity metrics (kg/servings).

