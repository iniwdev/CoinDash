from pydantic import BaseModel, EmailStr, field_validator


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


# ── Responses ─────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    """Minimal user object returned to frontend. Matches legacy Express shape."""
    id: str
    email: str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Matches legacy Express auth response shape exactly."""
    message: str
    token: str
    user: UserOut


class MeResponse(BaseModel):
    """Matches legacy GET /api/auth/me response shape."""
    user: UserOut
