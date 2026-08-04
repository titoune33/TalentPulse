"""
Authentication routes for TalentPulse
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta

from database import get_db
from schemas.user import UserCreate, UserResponse, UserLogin, TokenResponse
from schemas.talent import TalentCreate, TalentResponse
from services.auth_service import auth_service
from services.talent_service import talent_service
from models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Hash password
    hashed_password = auth_service.hash_password(user_data.password)

    # Create user
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
        role=user_data.role,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create associated talent if this is an employee
    if db_user.role == UserRole.EMPLOYEE:
        talent_service.create_talent(
            db,
            TalentCreate(
                first_name=user_data.name.split()[0] if user_data.name else "",
                last_name=user_data.name.split()[-1] if user_data.name else "",
                email=user_data.email,
            ),
            user_id=db_user.id
        )

    return db_user


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """Get access token for authenticated user"""
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=30)
    access_token = auth_service.create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@router.post("/refresh")
async def refresh_token(
    current_user: UserResponse,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    access_token_expires = timedelta(minutes=30)
    access_token = auth_service.create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
