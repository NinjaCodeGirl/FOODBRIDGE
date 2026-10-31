import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
    notifications
)

app = FastAPI(
    title=settings.APP_NAME,
    description="End-to-End AI-Powered Surplus Food Redistribution Ecosystem, Verification Ledger & B2B SaaS Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static File Storage for Verified Evidence Media
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include API Routers
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

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "architecture": "FastAPI + Gemini AI + Supabase + QR Verification Ledger + B2B SaaS Subscriptions + CSR Engine",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
