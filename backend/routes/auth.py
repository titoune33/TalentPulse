"""
Authentication routes for TalentPulse
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta

from database import get_db
from schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePassword,
    TokenResponse,
)
from schemas.talent import TalentCreate
from services.auth_service import auth_service, get_current_user
from services.talent_service import talent_service
from models.user import User, UserRole

router = APIRouter(tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """Register a new user"""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà",
        )

    hashed_password = auth_service.hash_password(user_data.password)

    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
        role=user_data.role,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create an associated talent profile for employees
    if db_user.role == UserRole.EMPLOYEE and user_data.name:
        parts = user_data.name.strip().split()
        talent_service.create_talent(
            db,
            TalentCreate(
                first_name=parts[0],
                last_name=parts[-1] if len(parts) > 1 else "",
                email=user_data.email,
            ),
            user_id=db_user.id,
        )

    return db_user


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """Get an access token for an authenticated user"""
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Issue a fresh access token for the authenticated user"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable",
        )

    access_token = auth_service.create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile"""
    if user_data.email is not None and user_data.email != current_user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà",
            )
        current_user.email = user_data.email

    if user_data.name is not None:
        current_user.name = user_data.name

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the current user's password"""
    if not auth_service.verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mot de passe actuel est incorrect",
        )

    current_user.hashed_password = auth_service.hash_password(data.new_password)
    db.commit()
    return {"message": "Mot de passe mis à jour avec succès"}
