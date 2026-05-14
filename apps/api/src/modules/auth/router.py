from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.modules.auth import service
from src.modules.auth.dependencies import CurrentUser
from src.modules.auth.schemas import (
    LoginRequest, 
    SignupRequest, 
    Token, 
    UserOut, 
    RefreshTokenRequest
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup", 
    response_model=Token, 
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    """
    Creates a new user account and returns a set of tokens.
    """
    return await service.signup(db, payload)


@router.post(
    "/login", 
    response_model=Token,
    summary="User login"
)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticates a user and returns access and refresh tokens.
    """
    return await service.login(db, payload)


@router.post(
    "/refresh", 
    response_model=Token,
    summary="Refresh tokens"
)
async def refresh(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Rotates tokens using a valid refresh token.
    The old refresh token is revoked.
    """
    return await service.refresh_tokens(db, payload.refresh_token)


@router.post(
    "/logout", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="User logout"
)
async def logout(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Revokes the provided refresh token to end the session.
    """
    await service.logout(db, payload.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/me", 
    response_model=UserOut,
    summary="Get current user"
)
async def get_me(user: CurrentUser):
    """
    Returns the profile of the currently authenticated user.
    """
    return user
