# UNION FOOD BRIDGE — Backend Setup & Local Development Manual

**Engine**: FastAPI + Uvicorn + Pydantic v2  
**Python Compatibility**: Python 3.10 to 3.14 (Verified on Python 3.14.2)  
**Database**: PostgreSQL / Supabase with PostGIS spatial coordinates

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Python**: v3.10 or higher (`python --version`)
- **Git**: (`git --version`)
- **Node.js**: v18.0.0 or higher (for frontend Vite build)

---

## 2. Step-by-Step Installation

### Step 1: Clone Repository & Navigate to Backend
```bash
git clone https://github.com/NinjaCodeGirl/Union_FoodBridge.git
cd Union_FoodBridge/backend
```

### Step 2: Create and Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- **Linux / macOS**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### Step 3: Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy the template file to `.env`:
- **Windows**:
  ```powershell
  copy ..\.env.example .env
  ```
- **Linux / macOS**:
  ```bash
  cp ../.env.example .env
  ```

Update secret keys:
```powershell
# Generate a secure 64-char hex key:
python -c "import secrets; print(secrets.token_hex(32))"
```
Place this string into `SECRET_KEY` in `.env`.

### Step 5: Database Setup (Optional for Local Memory Mode)
FoodBridge includes an in-memory database store with pre-seeded personas for rapid development.
To connect a live PostgreSQL/Supabase instance:
```bash
# Execute schema.sql against your database:
psql -h <host> -U <user> -d <dbname> -f ../database/schema.sql
```

### Step 6: Start FastAPI Uvicorn Server
```bash
uvicorn app.main:app --reload --port 8000
```
Server will be online at: **`http://localhost:8000`**  
Interactive OpenAPI documentation: **`http://localhost:8000/docs`**

---

## 3. Running Automated Test Suites

FoodBridge contains an automated test suite across all lifecycle and security modules:

```bash
# From repository root:
# Windows (PowerShell):
$env:PYTHONPATH="backend"; python -m unittest discover -s backend/tests -p "test_*.py" -v

# Linux / macOS:
PYTHONPATH=backend python3 -m unittest discover -s backend/tests -p "test_*.py" -v
```

---

## 4. Pre-Seeded Demonstration Personas

All personas share the standard password: **`FoodBridge@2026!`**

| Persona | Role | Email | Capabilities |
|---------|------|-------|--------------|
| **Taj Palace Banquet Kitchen** | `RESTAURANT` | `taj@foodbridge.org` | List surplus meals, AI freshness screening, handover QR/OTP, analytics. |
| **Akshaya Patra Foundation** | `RECIPIENT` | `akshaya@foodbridge.org` | 5-minute offer acceptance, radius search, intake logging, distribution proof. |
| **Arjun Sharma** | `VOLUNTEER` | `arjun@foodbridge.org` | Rapid dispatch console, live GPS route map, countdown, delay reporting, evidence upload. |
| **System Governance Admin** | `ADMIN` | `admin@foodbridge.org` | Audits, tamper-proof SHA-256 evidence inspection, pricing updates, revenue metrics. |

