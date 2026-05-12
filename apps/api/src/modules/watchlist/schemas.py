import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Request Schemas ───────────────────────────────────────────────────────────
class WatchlistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class WatchlistRename(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class WatchlistAddCoin(BaseModel):
    coin_id: str = Field(..., min_length=1, max_length=100, examples=["bitcoin"])


# ── Response Schemas ──────────────────────────────────────────────────────────
class WatchlistCoinOut(BaseModel):
    id: uuid.UUID
    coin_id: str

    model_config = ConfigDict(from_attributes=True)


class WatchlistOut(BaseModel):
    id: uuid.UUID
    name: str
    is_main: bool
    coins: list[WatchlistCoinOut]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WatchlistListOut(BaseModel):
    watchlists: list[WatchlistOut]
    active_watchlist_id: uuid.UUID | None = None
