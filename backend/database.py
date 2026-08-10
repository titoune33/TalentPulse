"""
Database configuration for TalentPulse
SQLAlchemy with PostgreSQL in production, SQLite for local development.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
# In production (Render/Railway) set DATABASE_URL to a PostgreSQL URL.
# Locally, if DATABASE_URL is unset, fall back to SQLite for zero-config dev.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./talentpulse.db")

# SQLite needs check_same_thread=False for FastAPI's threadpool
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
