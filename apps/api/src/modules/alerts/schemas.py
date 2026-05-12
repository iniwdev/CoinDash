import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Request Schemas ───────────────────────────────────────────────────────────
class AlertCreate(BaseModel):
    coin_id: str = Field(..., min_length=1, max_length=100, examples=["bitcoin"])
    type: str = Field(..., examples=["price_above", "price_below"])
    value: float = Field(..., gt=0)


# ── Response Schemas ──────────────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: uuid.UUID
    coin_id: str
    type: str
    value: float
    is_triggered: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertListOut(BaseModel):
    alerts: list[AlertOut]
