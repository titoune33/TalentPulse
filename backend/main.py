"""
TalentPulse Backend - FastAPI Application
SaaS for HR: Turnover prediction, collaborative network, HR automation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from routes import talents, auth, predictions

# Create FastAPI app
app = FastAPI(
    title="TalentPulse API",
    description="SaaS platform for HR: Talent management, turnover prediction, and HR automation",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://talentpulse.netlify.app",
        os.getenv("CORS_ORIGIN", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(talents.router, prefix="/api/talents", tags=["talents"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "TalentPulse API is running"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "TalentPulse API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "description": "SaaS platform for HR management",
    }

# Mount static files (if needed)
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
