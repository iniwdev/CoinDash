import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.exceptions import BadRequestError, ConflictError, UnauthorizedError
from src.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    decode_token
)
from src.modules.auth.models import User, RefreshToken
from src.modules.auth.schemas import LoginRequest, SignupRequest, Token, UserOut

logger = logging.getLogger(__name__)


async def signup(db: AsyncSession, payload: SignupRequest) -> Token:
    """Register a new user and return tokens."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise ConflictError("User with this email already exists")

    # Create user
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    await db.flush()
    
    logger.info("New user registered: %s", user.email)
    return await create_token_pair(db, user)


async def login(db: AsyncSession, payload: LoginRequest) -> Token:
    """Authenticate user and return tokens."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedError("Account is disabled")

    logger.info("User logged in: %s", user.email)
    return await create_token_pair(db, user)


async def create_token_pair(db: AsyncSession, user: User) -> Token:
    """Generate access and refresh tokens and save refresh token to DB."""
    access_token = create_access_token(subject=user.id)
    refresh_token_str = create_refresh_token(subject=user.id)
    
    # Save refresh token to DB
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=UserOut.model_validate(user)
    )


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> Token:
    """Rotate tokens using a valid refresh token."""
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")
        user_id = payload.get("sub")
    except Exception:
        raise UnauthorizedError("Invalid refresh token")

    # Check token in DB
    result = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.token == refresh_token)
        .where(RefreshToken.is_revoked == False)
        .where(RefreshToken.expires_at > datetime.now(timezone.utc))
    )
    db_token = result.scalar_one_or_none()
    
    if not db_token:
        raise UnauthorizedError("Refresh token invalid or expired")

    # Fetch user
    user_id_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    user_result = await db.execute(select(User).where(User.id == user_id_uuid))
    user = user_result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    # Revoke old token (or delete it)
    await db.delete(db_token)
    
    # Create new pair
    return await create_token_pair(db, user)


async def logout(db: AsyncSession, refresh_token: str) -> None:
    """Revoke a refresh token."""
    await db.execute(
        delete(RefreshToken).where(RefreshToken.token == refresh_token)
    )


async def get_user_by_id(db: AsyncSession, user_id: str | uuid.UUID) -> Optional[User]:
    """Fetch user by ID."""
    if isinstance(user_id, str):
        try:
            user_id = uuid.UUID(user_id)
        except ValueError:
            return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
