"""
Portfolio service layer — CoinDash

All business logic for the portfolio engine:
    - Portfolio CRUD (create, list, ensure default)
    - Trade execution (BUY / SELL with atomic P&L)
    - Holdings retrieval with live prices
    - Portfolio summary with unrealized P&L
    - Transaction history (paginated)
    - Holdings cache recalculation
    - Redis cache invalidation
"""

from __future__ import annotations

import logging
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy import select, func as sa_func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import BadRequestError, NotFoundError
from src.db.redis import get_redis, cache_get, cache_set
from src.modules.portfolio.models import (
    Portfolio, Transaction, HoldingsCache, TransactionType,
)
from src.modules.portfolio.engine import (
    recalculate_holding,
    calculate_realized_pnl,
    calculate_unrealized_pnl,
    calculate_allocation,
)
from src.modules.portfolio.schemas import TransactionCreate
from src.modules.coins.service import get_markets

logger = logging.getLogger(__name__)

HOLDINGS_CACHE_TTL = 60   # 1 minute
SUMMARY_CACHE_TTL = 60


# ─────────────────────────────────────────────────────────────────────────────
# Redis cache helpers
# ─────────────────────────────────────────────────────────────────────────────
async def _invalidate_portfolio_cache(user_id: uuid.UUID) -> None:
    """Wipe all portfolio caches for a user after a trade."""
    try:
        client = get_redis()
        keys = []
        async for key in client.scan_iter(f"portfolio:{user_id}:*"):
            keys.append(key)
        if keys:
            await client.delete(*keys)
            logger.debug("Invalidated %d portfolio cache keys for user %s", len(keys), user_id)
    except Exception as exc:
        logger.warning("Redis invalidation failed (non-fatal): %s", exc)


# ─────────────────────────────────────────────────────────────────────────────
# Portfolio CRUD
# ─────────────────────────────────────────────────────────────────────────────
async def ensure_default_portfolio(
    db: AsyncSession, user_id: uuid.UUID
) -> Portfolio:
    """Get or create the user's default portfolio."""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.user_id == user_id,
            Portfolio.is_default == True,
        )
    )
    portfolio = result.scalar_one_or_none()
    if portfolio:
        return portfolio

    portfolio = Portfolio(
        user_id=user_id,
        name="Main Portfolio",
        currency="USD",
        is_default=True,
    )
    db.add(portfolio)
    await db.flush()
    await db.refresh(portfolio)
    logger.info("Created default portfolio for user %s", user_id)
    return portfolio


async def list_portfolios(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Portfolio]:
    """List all portfolios for a user."""
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == user_id)
        .order_by(Portfolio.created_at)
    )
    return list(result.scalars().all())


async def create_portfolio(
    db: AsyncSession, user_id: uuid.UUID, name: str, currency: str = "USD"
) -> Portfolio:
    """Create a new named portfolio."""
    portfolio = Portfolio(
        user_id=user_id,
        name=name,
        currency=currency,
        is_default=False,
    )
    db.add(portfolio)
    await db.flush()
    await db.refresh(portfolio)
    return portfolio


async def _get_portfolio_or_404(
    db: AsyncSession, portfolio_id: uuid.UUID, user_id: uuid.UUID
) -> Portfolio:
    """Fetch a portfolio, verifying ownership."""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user_id,
        )
    )
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise NotFoundError("Portfolio not found")
    return portfolio


# ─────────────────────────────────────────────────────────────────────────────
# Holdings Cache Recalculation
# ─────────────────────────────────────────────────────────────────────────────
async def _recalculate_holding(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    coin_id: str,
    coin_symbol: str,
) -> HoldingsCache:
    """
    Rebuild the holdings_cache row for a specific (portfolio, coin) pair
    from the raw transaction ledger. Called after every trade.
    """
    # Aggregate BUY totals
    buy_result = await db.execute(
        select(
            sa_func.coalesce(sa_func.sum(Transaction.quantity), Decimal("0")),
            sa_func.coalesce(sa_func.sum(Transaction.total_value), Decimal("0")),
        ).where(
            Transaction.portfolio_id == portfolio_id,
            Transaction.coin_id == coin_id,
            Transaction.type == TransactionType.BUY,
        )
    )
    buy_row = buy_result.one()
    buy_qty_total = buy_row[0]
    buy_cost_total = buy_row[1]

    # Aggregate SELL totals
    sell_result = await db.execute(
        select(
            sa_func.coalesce(sa_func.sum(Transaction.quantity), Decimal("0")),
        ).where(
            Transaction.portfolio_id == portfolio_id,
            Transaction.coin_id == coin_id,
            Transaction.type == TransactionType.SELL,
        )
    )
    sell_qty_total = sell_result.scalar_one()

    # Pure calculation
    holding_data = recalculate_holding(buy_qty_total, buy_cost_total, sell_qty_total)

    # Upsert holdings_cache
    result = await db.execute(
        select(HoldingsCache).where(
            HoldingsCache.portfolio_id == portfolio_id,
            HoldingsCache.coin_id == coin_id,
        )
    )
    cache_row = result.scalar_one_or_none()

    if cache_row:
        cache_row.total_quantity = holding_data["total_quantity"]
        cache_row.avg_cost_basis = holding_data["avg_cost_basis"]
        cache_row.total_invested = holding_data["total_invested"]
        cache_row.coin_symbol = coin_symbol
        cache_row.last_recalculated = datetime.now(timezone.utc)
    else:
        cache_row = HoldingsCache(
            portfolio_id=portfolio_id,
            coin_id=coin_id,
            coin_symbol=coin_symbol.upper(),
            total_quantity=holding_data["total_quantity"],
            avg_cost_basis=holding_data["avg_cost_basis"],
            total_invested=holding_data["total_invested"],
        )
        db.add(cache_row)

    await db.flush()
    return cache_row


# ─────────────────────────────────────────────────────────────────────────────
# Trade Execution
# ─────────────────────────────────────────────────────────────────────────────
async def execute_trade(
    db: AsyncSession,
    user_id: uuid.UUID,
    portfolio_id: uuid.UUID,
    payload: TransactionCreate,
) -> Transaction:
    """
    Atomic trade execution pipeline:
        1. Validate ownership
        2. For SELL: verify sufficient holdings + compute realized P&L
        3. INSERT immutable transaction
        4. Recalculate holdings_cache
        5. Invalidate Redis caches
    """
    # 1. Ownership check
    portfolio = await _get_portfolio_or_404(db, portfolio_id, user_id)

    # 2. Compute total_value
    total_value = payload.quantity * payload.price_per_unit

    realized_pnl = None

    if payload.type == "SELL":
        # Get current holding
        result = await db.execute(
            select(HoldingsCache).where(
                HoldingsCache.portfolio_id == portfolio_id,
                HoldingsCache.coin_id == payload.coin_id,
            )
        )
        holding = result.scalar_one_or_none()

        if not holding or holding.total_quantity < payload.quantity:
            held = holding.total_quantity if holding else Decimal("0")
            raise BadRequestError(
                f"Insufficient {payload.coin_symbol.upper()} balance. "
                f"You hold {held}, trying to sell {payload.quantity}."
            )

        # Calculate realized P&L (weighted average)
        realized_pnl = calculate_realized_pnl(
            sell_qty=payload.quantity,
            sell_price=payload.price_per_unit,
            avg_cost_basis=holding.avg_cost_basis,
        )

    # 3. INSERT transaction (immutable)
    txn = Transaction(
        portfolio_id=portfolio_id,
        coin_id=payload.coin_id,
        coin_symbol=payload.coin_symbol.upper(),
        type=TransactionType(payload.type),
        quantity=payload.quantity,
        price_per_unit=payload.price_per_unit,
        total_value=total_value,
        fee=payload.fee,
        realized_pnl=realized_pnl,
        notes=payload.notes,
        executed_at=payload.executed_at or datetime.now(timezone.utc),
    )
    db.add(txn)
    await db.flush()

    # 4. Recalculate holdings cache
    await _recalculate_holding(db, portfolio_id, payload.coin_id, payload.coin_symbol)

    # 5. Invalidate Redis
    await _invalidate_portfolio_cache(user_id)

    await db.refresh(txn)
    logger.info(
        "Trade executed: %s %s %s @ %s (pnl=%s)",
        payload.type, payload.quantity, payload.coin_symbol,
        payload.price_per_unit, realized_pnl,
    )
    return txn


# ─────────────────────────────────────────────────────────────────────────────
# Transaction History
# ─────────────────────────────────────────────────────────────────────────────
async def get_transactions(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    user_id: uuid.UUID,
    page: int = 1,
    per_page: int = 20,
    coin_id: str | None = None,
    txn_type: str | None = None,
) -> tuple[list[Transaction], int]:
    """Paginated transaction history with optional filters."""
    # Verify ownership
    await _get_portfolio_or_404(db, portfolio_id, user_id)

    # Build base query
    conditions = [Transaction.portfolio_id == portfolio_id]
    if coin_id:
        conditions.append(Transaction.coin_id == coin_id)
    if txn_type:
        conditions.append(Transaction.type == TransactionType(txn_type))

    where = and_(*conditions)

    # Count
    count_result = await db.execute(
        select(sa_func.count(Transaction.id)).where(where)
    )
    total = count_result.scalar_one()

    # Fetch page
    offset = (page - 1) * per_page
    result = await db.execute(
        select(Transaction)
        .where(where)
        .order_by(Transaction.executed_at.desc())
        .limit(per_page)
        .offset(offset)
    )
    transactions = list(result.scalars().all())

    return transactions, total


# ─────────────────────────────────────────────────────────────────────────────
# Holdings with Live Prices
# ─────────────────────────────────────────────────────────────────────────────
async def _get_live_prices(coin_ids: list[str]) -> dict[str, Decimal]:
    """Fetch current prices for a list of coin IDs from CoinGecko (cached)."""
    if not coin_ids:
        return {}

    ids_str = ",".join(coin_ids)
    try:
        market_data = await get_markets(
            ids=ids_str, per_page=len(coin_ids), sparkline=False
        )
        return {
            coin["id"]: Decimal(str(coin.get("current_price", 0)))
            for coin in market_data
        }
    except Exception as exc:
        logger.error("Failed to fetch live prices: %s", exc)
        return {}


async def get_holdings(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    user_id: uuid.UUID,
) -> list[dict]:
    """
    Get current holdings with live prices, unrealized P&L, and allocation.
    """
    await _get_portfolio_or_404(db, portfolio_id, user_id)

    # Check Redis cache first
    cache_key = f"portfolio:{user_id}:holdings:{portfolio_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Fetch from DB
    result = await db.execute(
        select(HoldingsCache)
        .where(
            HoldingsCache.portfolio_id == portfolio_id,
            HoldingsCache.total_quantity > 0,
        )
    )
    cache_rows = list(result.scalars().all())

    if not cache_rows:
        return []

    # Get live prices
    coin_ids = [row.coin_id for row in cache_rows]
    prices = await _get_live_prices(coin_ids)

    # Build enriched holdings
    holdings = []
    for row in cache_rows:
        current_price = prices.get(row.coin_id, Decimal("0"))
        pnl_data = calculate_unrealized_pnl(
            quantity_held=row.total_quantity,
            avg_cost_basis=row.avg_cost_basis,
            current_price=current_price,
        )
        holdings.append({
            "coin_id": row.coin_id,
            "coin_symbol": row.coin_symbol,
            "quantity": str(row.total_quantity),
            "avg_cost_basis": str(row.avg_cost_basis),
            "total_invested": str(row.total_invested),
            "current_price": str(current_price),
            "current_value": str(pnl_data["current_value"]),
            "unrealized_pnl": str(pnl_data["unrealized_pnl"]),
            "unrealized_pnl_pct": str(pnl_data["unrealized_pnl_pct"]),
            "allocation_pct": "0",  # calculated below
        })

    # Calculate allocation
    for h in holdings:
        h["current_value"] = Decimal(h["current_value"])
    calculate_allocation(holdings)
    for h in holdings:
        h["allocation_pct"] = str(h["allocation_pct"])
        h["current_value"] = str(h["current_value"])

    # Cache
    await cache_set(cache_key, holdings, HOLDINGS_CACHE_TTL)

    return holdings


# ─────────────────────────────────────────────────────────────────────────────
# Portfolio Summary
# ─────────────────────────────────────────────────────────────────────────────
async def get_summary(
    db: AsyncSession,
    portfolio_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict:
    """Full portfolio summary: total value, P&L, holdings with live data."""
    portfolio = await _get_portfolio_or_404(db, portfolio_id, user_id)

    # Check cache
    cache_key = f"portfolio:{user_id}:summary:{portfolio_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Get enriched holdings
    holdings = await get_holdings(db, portfolio_id, user_id)

    # Aggregate totals
    total_value = sum(Decimal(h["current_value"]) for h in holdings)
    total_invested = sum(Decimal(h["total_invested"]) for h in holdings)
    total_unrealized = total_value - total_invested

    pnl_pct = Decimal("0")
    if total_invested > 0:
        pnl_pct = ((total_unrealized / total_invested) * 100).quantize(Decimal("0.01"))

    # Total realized P&L from all SELL transactions
    realized_result = await db.execute(
        select(
            sa_func.coalesce(sa_func.sum(Transaction.realized_pnl), Decimal("0"))
        ).where(
            Transaction.portfolio_id == portfolio_id,
            Transaction.type == TransactionType.SELL,
        )
    )
    total_realized = realized_result.scalar_one()

    summary = {
        "portfolio_id": str(portfolio.id),
        "portfolio_name": portfolio.name,
        "total_value": str(total_value.quantize(Decimal("0.01"))),
        "total_invested": str(total_invested.quantize(Decimal("0.01"))),
        "total_pnl": str(total_unrealized.quantize(Decimal("0.01"))),
        "total_pnl_pct": str(pnl_pct),
        "total_realized_pnl": str(total_realized),
        "holdings_count": len(holdings),
        "holdings": holdings,
    }

    await cache_set(cache_key, summary, SUMMARY_CACHE_TTL)
    return summary
