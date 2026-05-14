import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


# ── Requests ──────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Responses ─────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    """Minimal user object returned to frontend. Matches legacy Express shape."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    """Token response for login/refresh."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Internal ──────────────────────────────────────────────────────────────────
class TokenData(BaseModel):
    """Payload stored in JWT."""
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None  # 'access' or 'refresh'
