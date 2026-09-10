"""
Authentication service TalentPulse
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, UserRole

load_dotenv()

# Security configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-me-in-production')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '1440'))  # 24h default

# Password hashing
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# OAuth2 scheme to extract bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/token')


class AuthService:
    """
    Service handling authentication
    """
    ACCESS_TOKEN_EXPIRE_MINUTES = ACCESS_TOKEN_EXPIRE_MINUTES

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        now = datetime.now(timezone.utc)
        if expires_delta:
            expire = now + expires_delta
        else:
            expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({'exp': expire, 'iat': now})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> dict:
        """Decode and verify JWT access token, raising 401 on failure"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Token invalide ou expiré'
            )


# Module-level singleton
auth_service = AuthService()

# Dependency: get current authenticated user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    payload = auth_service.decode_access_token(token)
    user_id: Optional[int] = payload.get('sub')
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Impossible de valider les identifiants'
        )
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Utilisateur non trouvé ou désactivé'
        )
    return user


# Dependency: require specific role
def require_role(required_role: UserRole):
    """Return a dependency that checks if user has the required role"""
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        user_roles = {u.value for u in UserRole}
        allowed_roles = {required_role.value}
        # Admin can do everything
        if user.role == UserRole.ADMIN:
            return user
        if user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Accès refusé: rôle insuffisant'
            )
        return user
    return role_checker


# Dependency: require any of the listed roles
def require_any_role(required_roles: list[UserRole]):
    """Return a dependency that checks if user has any of the required roles"""
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role == UserRole.ADMIN:
            return user
        user_role_values = {r.value for r in required_roles}
        if user.role.value not in user_role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Accès refusé: rôle insuffisant'
            )
        return user
    return role_checker
