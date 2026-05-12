from fastapi import APIRouter, Query
from typing import Optional

from src.modules.coins import service

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/coins/markets")
async def get_markets(
    vs_currency: str = Query("usd"),
    order: str = Query("market_cap_desc"),
    per_page: int = Query(20, ge=1, le=250),
    page: int = Query(1, ge=1),
    sparkline: bool = Query(False),
    price_change_percentage: str = Query("24h"),
    ids: Optional[str] = Query(None, description="Comma-separated list of coin ids to filter"),
):
    """Proxy market data with Redis caching. Mirrors legacy /api/market/coins/markets."""
    return await service.get_markets(
        vs_currency=vs_currency,
        order=order,
        per_page=per_page,
        page=page,
        sparkline=sparkline,
        price_change_percentage=price_change_percentage,
        ids=ids,
    )


@router.get("/coins/{coin_id}/market_chart")
async def get_coin_chart(
    coin_id: str,
    vs_currency: str = Query("usd"),
    days: str = Query("7"),
    interval: Optional[str] = Query(None, description="Data interval: 'daily' or 'hourly'"),
):
    """Proxy coin chart data with Redis caching. Mirrors legacy /api/market/coins/:id/market_chart."""
    return await service.get_coin_chart(coin_id, vs_currency, days, interval=interval)


@router.get("/exchanges")
async def get_exchanges(
    per_page: int = Query(100, ge=1, le=250),
    page: int = Query(1, ge=1),
):
    """Proxy exchange data with Redis caching. Mirrors legacy /api/market/exchanges."""
    return await service.get_exchanges(per_page=per_page, page=page)

