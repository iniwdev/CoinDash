import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import BadRequestError, ConflictError, UnauthorizedError
from src.core.security import create_access_token, hash_password, verify_password
from src.modules.auth.models import User
from src.modules.auth.schemas import AuthResponse, LoginRequest, MeResponse, SignupRequest, UserOut

logger = logging.getLogger(__name__)


def _user_to_out(user: User) -> UserOut:
    return UserOut(id=str(user.id), email=user.email)


def _make_token(user: User) -> str:
    return create_access_token({"sub": str(user.id), "email": user.email})


async def signup(db: AsyncSession, payload: SignupRequest) -> AuthResponse:
    # Check for duplicate email
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise ConflictError("User already exists")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()  # flush to get the generated id before commit

    logger.info("New user registered: %s", user.email)
    return AuthResponse(
        message="User created successfully",
        token=_make_token(user),
        user=_user_to_out(user),
    )


async def login(db: AsyncSession, payload: LoginRequest) -> AuthResponse:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedError("Invalid credentials")

    if not user.is_active:
        raise UnauthorizedError("Account is disabled")

    logger.info("User logged in: %s", user.email)
    return AuthResponse(
        message="Login successful",
        token=_make_token(user),
        user=_user_to_out(user),
    )


async def get_me(db: AsyncSession, user_id: str) -> MeResponse:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found")
    return MeResponse(user=_user_to_out(user))
