"""
Portfolio router — CoinDash

Endpoints:
    POST   /portfolio                   — Create a new named portfolio
    GET    /portfolio                   — List all user portfolios
    POST   /portfolio/{id}/transactions — Execute a BUY or SELL trade
    GET    /portfolio/{id}/transactions — Paginated transaction history
    GET    /portfolio/{id}/holdings     — Current holdings with live prices + P&L
    GET    /portfolio/{id}/summary      — Full portfolio summary
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.modules.auth.dependencies import CurrentUser
from src.modules.portfolio import service
from src.modules.portfolio.schemas import (
    PortfolioCreate,
    PortfolioResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionListResponse,
    HoldingsListResponse,
    HoldingResponse,
    PortfolioSummary,
)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# ── Portfolio CRUD ────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=list[PortfolioResponse],
    summary="List all portfolios",
)
async def list_portfolios(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """List all portfolios for the authenticated user."""
    portfolios = await service.list_portfolios(db, current_user.id)

    # Auto-create default portfolio if none exist
    if not portfolios:
        default = await service.ensure_default_portfolio(db, current_user.id)
        portfolios = [default]

    return portfolios


@router.post(
    "",
    response_model=PortfolioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new portfolio",
)
async def create_portfolio(
    body: PortfolioCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Create a new named portfolio."""
    return await service.create_portfolio(
        db, current_user.id, body.name, body.currency
    )


# ── Trade Execution ──────────────────────────────────────────────────────────

@router.post(
    "/{portfolio_id}/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Execute a trade (BUY or SELL)",
)
async def execute_trade(
    portfolio_id: uuid.UUID,
    body: TransactionCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute a BUY or SELL trade on the portfolio.

    For SELL trades:
    - Validates sufficient holdings
    - Calculates realized P&L using weighted-average cost basis
    - Records the P&L on the transaction

    All trades are immutable ledger entries.
    """
    return await service.execute_trade(
        db, current_user.id, portfolio_id, body
    )


# ── Transaction History ──────────────────────────────────────────────────────

@router.get(
    "/{portfolio_id}/transactions",
    response_model=TransactionListResponse,
    summary="List transaction history",
)
async def list_transactions(
    portfolio_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    coin_id: str | None = Query(default=None),
    type: str | None = Query(default=None, pattern=r"^(BUY|SELL)$"),
):
    """Paginated transaction history with optional coin and type filters."""
    transactions, total = await service.get_transactions(
        db, portfolio_id, current_user.id,
        page=page, per_page=per_page,
        coin_id=coin_id, txn_type=type,
    )
    return TransactionListResponse(
        transactions=transactions,
        total=total,
        page=page,
        per_page=per_page,
    )


# ── Holdings ─────────────────────────────────────────────────────────────────

@router.get(
    "/{portfolio_id}/holdings",
    summary="Get current holdings with live prices",
)
async def get_holdings(
    portfolio_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Current holdings enriched with live prices, unrealized P&L, and allocation %."""
    holdings = await service.get_holdings(db, portfolio_id, current_user.id)
    return {"holdings": holdings}


# ── Portfolio Summary ────────────────────────────────────────────────────────

@router.get(
    "/{portfolio_id}/summary",
    summary="Get portfolio summary",
)
async def get_summary(
    portfolio_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Full portfolio summary: total value, P&L, allocation, all holdings."""
    return await service.get_summary(db, portfolio_id, current_user.id)
