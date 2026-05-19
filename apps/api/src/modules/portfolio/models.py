"""
Portfolio ORM models — CoinDash

Three tables forming the financial core:
    portfolios       — Named portfolio containers (one default per user)
    transactions     — Append-only immutable trade ledger (BUY / SELL)
    holdings_cache   — Materialized view of current holdings per coin

Design principle:
    The transaction ledger is the single source of truth.
    Holdings, P&L, allocation are all derived views.
"""

import enum
import uuid
from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, Numeric, DateTime, ForeignKey, Index, Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from src.modules.auth.models import User


# ── Enums ─────────────────────────────────────────────────────────────────────
class TransactionType(str, enum.Enum):
    """Immutable trade direction."""
    BUY = "BUY"
    SELL = "SELL"


# ── Portfolio ─────────────────────────────────────────────────────────────────
class Portfolio(Base, UUIDMixin, TimestampMixin):
    """
    A named portfolio belonging to a user.
    Users get a default 'Main Portfolio' on first access.
    """
    __tablename__ = "portfolios"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, default="Main Portfolio"
    )
    currency: Mapped[str] = mapped_column(
        String(10), nullable=False, default="USD"
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="portfolios")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="portfolio",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Transaction.executed_at.desc()",
    )
    holdings_cache: Mapped[list["HoldingsCache"]] = relationship(
        "HoldingsCache",
        back_populates="portfolio",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_portfolios_user_default", "user_id", "is_default"),
    )

    def __repr__(self) -> str:
        return f"<Portfolio name={self.name} user_id={self.user_id}>"


# ── Transaction (Immutable Ledger) ────────────────────────────────────────────
class Transaction(Base, UUIDMixin, TimestampMixin):
    """
    Immutable ledger entry. Append-only — never UPDATE or DELETE in production.

    Each row represents one trade (buy or sell) at a specific price.
    realized_pnl is calculated and stored at SELL time using the chosen
    cost-basis method (weighted average by default).
    """
    __tablename__ = "transactions"

    portfolio_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    coin_id: Mapped[str] = mapped_column(
        String(100), index=True, nullable=False
    )
    coin_symbol: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    type: Mapped[TransactionType] = mapped_column(
        String(10),
        nullable=False,
    )

    # Financial fields — Numeric for precision (no floating-point drift)
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=18), nullable=False
    )
    price_per_unit: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=8), nullable=False
    )
    total_value: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=8), nullable=False
    )
    fee: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=8), default=Decimal("0"), nullable=False
    )

    # P&L (only populated on SELL transactions)
    realized_pnl: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=28, scale=8), nullable=True
    )

    # Metadata
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    portfolio: Mapped["Portfolio"] = relationship(
        "Portfolio", back_populates="transactions"
    )

    __table_args__ = (
        Index("ix_txn_portfolio_coin", "portfolio_id", "coin_id"),
        Index("ix_txn_portfolio_date", "portfolio_id", "executed_at"),
    )

    def __repr__(self) -> str:
        return f"<Transaction {self.type.value} {self.quantity} {self.coin_symbol}>"


# ── Holdings Cache (Materialized View) ────────────────────────────────────────
class HoldingsCache(Base, UUIDMixin, TimestampMixin):
    """
    Materialized view of current holdings per coin per portfolio.

    NEVER the source of truth — always rebuildable from transactions.
    Recalculated after each trade. Also cached in Redis for sub-ms reads.
    """
    __tablename__ = "holdings_cache"

    portfolio_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    coin_id: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    coin_symbol: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    total_quantity: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=18), default=Decimal("0"), nullable=False
    )
    avg_cost_basis: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=8), default=Decimal("0"), nullable=False
    )
    total_invested: Mapped[Decimal] = mapped_column(
        Numeric(precision=28, scale=8), default=Decimal("0"), nullable=False
    )
    last_recalculated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    portfolio: Mapped["Portfolio"] = relationship(
        "Portfolio", back_populates="holdings_cache"
    )

    __table_args__ = (
        Index(
            "ix_holdings_portfolio_coin",
            "portfolio_id", "coin_id",
            unique=True,
        ),
    )

    def __repr__(self) -> str:
        return f"<HoldingsCache {self.coin_symbol} qty={self.total_quantity}>"
