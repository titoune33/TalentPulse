"""
TalentPulse Backend FastAPI Application
SaaS HR: turnover prediction, collaborative network, automation
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
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)
logger = logging.getLogger('talentpulse')

# Import models so SQLAlchemy metadata knows them, then routers
from database import Base, engine, SessionLocal
import models
from routes import talents, auth, predictions, billing
from services.seed_service import seed_if_empty
from models.talent import Talent
from models.prediction import Prediction
from models.user import User
from models.audit_log import AuditLog
import time

# Startup time health check
START_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed demo data on startup."""
    logger.info('Starting TalentPulse API...')
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        try:
            seed_if_empty(db)
        finally:
            db.close()
    logger.info('Database ready. API started successfully.')
    yield


app = FastAPI(
    title='TalentPulse API',
    description='Plateforme SaaS gestion des talents, prédiction turnover et automatisation RH',
    version='2.0.0',
    docs_url='/api/docs',
    redoc_url='/api/redoc',
    openapi_url='/api/openapi.json',
    lifespan=lifespan,
)

# CORS
CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGIN.split(',') if CORS_ORIGIN else ['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# Audit logging middleware
@app.middleware('http')
async def audit_middleware(request: Request, call_next):
    """Log every request to the audit log."""
    response = await call_next(request)
    # Try to get user from cookie or header (simplified — full auth needs token decode)
    user_id = None
    token = request.headers.get('authorization', '').replace('Bearer ', '')
    if token:
        try:
            from jose import jwt as jose_jwt
            from services.auth_service import SECRET_KEY, ALGORITHM
            payload = jose_jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get('sub')
        except Exception:
            pass
    logger.info(f'{request.method} {request.url.path} -> {response.status_code} (user={user_id})')
    return response


# Health check
@app.get('/api/health')
async def health_check():
    uptime = time.time() - START_TIME
    return {
        'status': 'healthy',
        'uptime_seconds': round(uptime, 2),
        'version': '2.0.0',
        'timestamp': datetime.now(timezone.utc).isoformat(),
    }


# Include routers
app.include_router(auth.router, prefix='/api/auth')
app.include_router(talents.router, prefix='/api/talents')
app.include_router(predictions.router, prefix='/api/predictions')
app.include_router(billing.router, prefix='/api/billing')


if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    logger.info(f'Starting server on port {port}')
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=False)
