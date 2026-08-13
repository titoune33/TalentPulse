"""
TalentPulse Backend - FastAPI Application
SaaS for HR: turnover prediction, collaborative network, HR automation
"""

import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("talentpulse")

# Import models so SQLAlchemy metadata knows about them, then DB + routers
from database import Base, engine, SessionLocal  # noqa: E402
import models  # noqa: F401  (registers all models on Base.metadata)
from routes import talents, auth, predictions, billing  # noqa: E402
from services.seed_service import seed_if_empty  # noqa: E402
from models.talent import Talent  # noqa: E402
from models.prediction import Prediction  # noqa: E402
from models.user import User  # noqa: E402
import time  # noqa: E402

# Startup time for health check
START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed demo data on startup."""
    logger.info("Starting TalentPulse API...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    logger.info("Database ready. API started successfully.")
    yield


app = FastAPI(
    title="TalentPulse API",
    description="Plateforme SaaS RH : gestion des talents, prédiction de turnover et automatisation RH",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# CORS configuration
default_origins = [
    "http://localhost:3000",
    "http://localhost:3100",
    "https://talentpulse.netlify.app",
]
cors_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGIN", ",".join(default_origins)).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(talents.router, prefix="/api/talents", tags=["talents"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])


# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({duration:.3f}s)"
    )
    return response


# Health check endpoint
@app.get("/api/health")
async def health_check():
    uptime = time.time() - START_TIME
    db = SessionLocal()
    try:
        total_talents = db.query(func.count(Talent.id)).scalar()
        total_predictions = db.query(func.count(Prediction.id)).scalar()
        total_users = db.query(func.count(User.id)).scalar()
    finally:
        db.close()
    return {
        "status": "ok",
        "message": "TalentPulse API is running",
        "version": "2.0.0",
        "uptime_seconds": round(uptime, 1),
        "stats": {
            "total_talents": total_talents,
            "total_predictions": total_predictions,
            "total_users": total_users,
        },
    }


# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "TalentPulse API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "description": "Plateforme SaaS pour la gestion des talents RH",
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur serveur interne. Nos équipes ont été notifiées."},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
