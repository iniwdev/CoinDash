from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import UnauthorizedError
from src.core.security import decode_access_token
from src.db.session import get_db

# ── DB dependency ─────────────────────────────────────────────────────────────
DbSession = Annotated[AsyncSession, Depends(get_db)]

# ── Auth scheme (defined here to avoid circular imports) ──────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """Extract and validate user_id from JWT bearer token."""
    try:
        payload = decode_access_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise UnauthorizedError("Invalid token payload")
        return user_id
    except JWTError:
        raise UnauthorizedError("Could not validate credentials")


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
