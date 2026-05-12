from fastapi import APIRouter, Depends, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import oauth2_scheme
from src.core.exceptions import UnauthorizedError
from src.core.security import decode_access_token
from src.db.session import get_db
from src.modules.auth import service
from src.modules.auth.schemas import AuthResponse, LoginRequest, MeResponse, SignupRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    return await service.signup(db, payload)


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await service.login(db, payload)


@router.get("/me", response_model=MeResponse)
async def get_me(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedError()
    except JWTError:
        raise UnauthorizedError("Could not validate credentials")

    return await service.get_me(db, user_id)
