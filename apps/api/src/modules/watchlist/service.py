import logging
import uuid

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.watchlist.models import Watchlist, WatchlistCoin
from src.db.redis import get_or_set, get_redis

logger = logging.getLogger(__name__)

WATCHLIST_CACHE_TTL = 300  # 5 minutes


def _cache_key(user_id: str) -> str:
    return f"watchlist:user:{user_id}"


async def _invalidate_cache(user_id: str) -> None:
    """Delete the user's watchlist cache so the next read is fresh."""
    try:
        client = get_redis()
        await client.delete(_cache_key(user_id))
    except Exception as exc:
        logger.warning("Redis cache invalidation failed (non-fatal): %s", exc)


# ── CRUD ──────────────────────────────────────────────────────────────────────
async def list_watchlists(db: AsyncSession, user_id: str) -> list[Watchlist]:
    """Get all watchlists for a user. Coins are eager-loaded via selectin."""
    result = await db.execute(
        select(Watchlist)
        .where(Watchlist.user_id == user_id)
        .order_by(Watchlist.created_at)
    )
    return list(result.scalars().all())


async def get_watchlist(db: AsyncSession, watchlist_id: uuid.UUID, user_id: str) -> Watchlist | None:
    result = await db.execute(
        select(Watchlist)
        .where(Watchlist.id == watchlist_id, Watchlist.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_watchlist(db: AsyncSession, user_id: str, name: str) -> Watchlist:
    watchlist = Watchlist(user_id=user_id, name=name)
    db.add(watchlist)
    await db.flush()
    await db.refresh(watchlist)
    await _invalidate_cache(user_id)
    return watchlist


async def rename_watchlist(db: AsyncSession, watchlist_id: uuid.UUID, user_id: str, name: str) -> Watchlist | None:
    watchlist = await get_watchlist(db, watchlist_id, user_id)
    if not watchlist:
        return None
    watchlist.name = name
    await db.flush()
    await db.refresh(watchlist)
    await _invalidate_cache(user_id)
    return watchlist


async def delete_watchlist(db: AsyncSession, watchlist_id: uuid.UUID, user_id: str) -> bool:
    watchlist = await get_watchlist(db, watchlist_id, user_id)
    if not watchlist:
        return False
    await db.delete(watchlist)
    await db.flush()
    await _invalidate_cache(user_id)
    return True


async def add_coin(db: AsyncSession, watchlist_id: uuid.UUID, user_id: str, coin_id: str) -> WatchlistCoin | None:
    watchlist = await get_watchlist(db, watchlist_id, user_id)
    if not watchlist:
        return None

    # Check for duplicate
    existing = await db.execute(
        select(WatchlistCoin)
        .where(WatchlistCoin.watchlist_id == watchlist_id, WatchlistCoin.coin_id == coin_id)
    )
    if existing.scalar_one_or_none():
        return None  # Already exists

    coin = WatchlistCoin(watchlist_id=str(watchlist_id), coin_id=coin_id)
    db.add(coin)
    await db.flush()
    await db.refresh(coin)
    await _invalidate_cache(user_id)
    return coin


async def remove_coin(db: AsyncSession, watchlist_id: uuid.UUID, user_id: str, coin_id: str) -> bool:
    watchlist = await get_watchlist(db, watchlist_id, user_id)
    if not watchlist:
        return False

    result = await db.execute(
        delete(WatchlistCoin)
        .where(WatchlistCoin.watchlist_id == watchlist_id, WatchlistCoin.coin_id == coin_id)
    )
    await _invalidate_cache(user_id)
    return result.rowcount > 0


async def ensure_default_watchlist(db: AsyncSession, user_id: str) -> Watchlist:
    """Get or create the user's default 'Main Portfolio' watchlist."""
    result = await db.execute(
        select(Watchlist)
        .where(Watchlist.user_id == user_id, Watchlist.is_main == True)
    )
    main = result.scalar_one_or_none()
    if main:
        return main

    main = Watchlist(user_id=user_id, name="Main Portfolio", is_main=True)
    default_coins = ["bitcoin", "ethereum", "solana"]
    for cid in default_coins:
        main.coins.append(WatchlistCoin(coin_id=cid))
    db.add(main)
    await db.flush()
    await db.refresh(main)
    return main
