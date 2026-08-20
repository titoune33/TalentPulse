"""
Authentication routes TalentPulse
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated, List
from datetime import timedelta

from database import get_db
from schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePassword,
    TokenResponse,
    UserListResponse,
)
from schemas.talent import TalentCreate
from services.auth_service import auth_service, get_current_user, require_role
from services.talent_service import talent_service
from models.user import User, UserRole

router = APIRouter(tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """Register new user"""
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

    # Create associated talent profile for employees
    if db_user.role == UserRole.EMPLOYEE and user_data.name:
        parts = user_data.name.strip().split()
        talent_service.create_talent(
            db,
            TalentCreate(
                first_name=parts[0],
                last_name=parts[1] if len(parts) > 1 else "",
                email=user_data.email,
            ),
        )

    return db_user


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """Login and return JWT token"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé",
        )

    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user profile"""
    return user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update current user profile"""
    if user_update.name:
        user.name = user_update.name
    if user_update.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé",
            )
        user.email = user_update.email
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/password", response_model=UserResponse)
async def change_password(
    pwd_data: ChangePassword,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Change current user password"""
    if not auth_service.verify_password(pwd_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect",
        )
    user.hashed_password = auth_service.hash_password(pwd_data.new_password)
    db.commit()
    db.refresh(user)
    return user


# Admin-only routes below


@router.get("/users", response_model=UserListResponse)
async def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    """List all users (admin only)"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {"users": [UserResponse.model_validate(u) for u in users]}


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    role: UserRole,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    """Update a user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if user.role == UserRole.ADMIN and role != UserRole.ADMIN:
        # Prevent removing admin role from last admin
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de retirer le rôle administrateur au dernier admin",
            )
    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/activate", response_model=UserResponse)
async def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    """Activate/deactivate a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
