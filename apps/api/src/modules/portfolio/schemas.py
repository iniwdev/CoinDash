"""
Portfolio Pydantic schemas — CoinDash

Request/response validation and serialization for all portfolio endpoints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


# ── Portfolio ─────────────────────────────────────────────────────────────────
class PortfolioCreate(BaseModel):
    name: str = Field(
        default="Main Portfolio",
        min_length=1,
        max_length=100,
        examples=["Main Portfolio"],
    )
    currency: str = Field(default="USD", max_length=10)


class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    currency: str
    is_default: bool
    created_at: datetime


# ── Transaction ───────────────────────────────────────────────────────────────
class TransactionCreate(BaseModel):
    coin_id: str = Field(..., min_length=1, max_length=100, examples=["bitcoin"])
    coin_symbol: str = Field(..., min_length=1, max_length=20, examples=["BTC"])
    type: str = Field(..., pattern=r"^(BUY|SELL)$", examples=["BUY"])
    quantity: Decimal = Field(..., gt=0, examples=["0.5"])
    price_per_unit: Decimal = Field(..., gt=0, examples=["67000.00"])
    fee: Decimal = Field(default=Decimal("0"), ge=0, examples=["0.00"])
    notes: Optional[str] = Field(default=None, max_length=500)
    executed_at: Optional[datetime] = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    coin_id: str
    coin_symbol: str
    type: str
    quantity: Decimal
    price_per_unit: Decimal
    total_value: Decimal
    fee: Decimal
    realized_pnl: Optional[Decimal] = None
    notes: Optional[str] = None
    executed_at: datetime
    created_at: datetime


class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int
    page: int
    per_page: int


# ── Holdings ──────────────────────────────────────────────────────────────────
class HoldingResponse(BaseModel):
    coin_id: str
    coin_symbol: str
    quantity: Decimal
    avg_cost_basis: Decimal
    total_invested: Decimal
    current_price: Decimal
    current_value: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_pct: Decimal
    allocation_pct: Decimal


class HoldingsListResponse(BaseModel):
    holdings: list[HoldingResponse]
    total_value: Decimal
    total_invested: Decimal


# ── Portfolio Summary ─────────────────────────────────────────────────────────
class PortfolioSummary(BaseModel):
    portfolio_id: uuid.UUID
    portfolio_name: str
    total_value: Decimal
    total_invested: Decimal
    total_pnl: Decimal
    total_pnl_pct: Decimal
    total_realized_pnl: Decimal
    holdings_count: int
    holdings: list[HoldingResponse]
