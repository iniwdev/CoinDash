from typing import Annotated

from fastapi import Depends
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import oauth2_scheme
from src.core.exceptions import UnauthorizedError
from src.core.security import decode_token
from src.db.session import get_db
from src.modules.auth import service
from src.modules.auth.models import User


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """
    Dependency to validate access token and return the current user.
    """
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if not user_id or token_type != "access":
            raise UnauthorizedError("Invalid token payload")
            
    except JWTError:
        raise UnauthorizedError("Could not validate credentials")

    user = await service.get_user_by_id(db, user_id)
    if not user:
        raise UnauthorizedError("User not found")
        
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Dependency to ensure the current user is active.
    """
    if not current_user.is_active:
        raise UnauthorizedError("User is inactive")
    return current_user


# Type hints for easy usage in routes
CurrentUser = Annotated[User, Depends(get_current_active_user)]
