"""
TalentPulse Backend - FastAPI Application
SaaS for HR: turnover prediction, collaborative network, HR automation
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Import models so SQLAlchemy metadata knows about them, then DB + routers
from database import Base, engine, SessionLocal
import models  # noqa: F401  (registers all models on Base.metadata)
from routes import talents, auth, predictions
from services.seed_service import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed demo data on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
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


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "TalentPulse API is running", "version": "2.0.0"}


# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "TalentPulse API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "description": "Plateforme SaaS pour la gestion des talents RH",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
