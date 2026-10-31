import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    auth,
    donations,
    ngo,
    qr,
    analytics,
    calls,
    ratings,
    subscriptions,
    revenue,
    distribution,
    evidence,
    deliveries,
    notifications,
    escalation
)

app = FastAPI(
    title=settings.APP_NAME,
    description="End-to-End AI-Powered Surplus Food Redistribution Ecosystem, Verification Ledger & B2B SaaS Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration — allow all origins for the public redistribution platform
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static File Storage for Verified Evidence Media
# In serverless (Vercel), files in /tmp are ephemeral but writable
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IS_SERVERLESS = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

if IS_SERVERLESS:
    UPLOADS_DIR = "/tmp/uploads"
else:
    UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)

# Only mount static files when NOT in serverless (avoids startup failure if dir is empty)
if not IS_SERVERLESS:
    from fastapi.staticfiles import StaticFiles
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include all API routers
app.include_router(auth.router)
app.include_router(donations.router)
app.include_router(ngo.router)
app.include_router(qr.router)
app.include_router(analytics.router)
app.include_router(calls.router)
app.include_router(ratings.router)
app.include_router(subscriptions.router)
app.include_router(revenue.router)
app.include_router(distribution.router)
app.include_router(evidence.router)
app.include_router(deliveries.router)
app.include_router(notifications.router)
app.include_router(escalation.router)


@app.get("/", tags=["Health Check"])
def root():
    """Backend health check — confirms the API is running."""
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "environment": "serverless" if IS_SERVERLESS else "local",
        "documentation": "/docs",
        "endpoints": [
            "/api/auth/login",
            "/api/donations/active",
            "/api/analytics/impact",
            "/api/evidence/upload",
            "/api/ngo/matching",
            "/api/qr/generate",
        ]
    }


@app.get("/api/health", tags=["Health Check"])
def health():
    """Live health probe."""
    return {"status": "healthy", "version": "2.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
