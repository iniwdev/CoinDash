import json
import logging
from collections.abc import AsyncGenerator, Callable
from typing import Any

import redis.asyncio as aioredis

from src.core.config import settings

logger = logging.getLogger(__name__)

# ── Client singleton (initialized in lifespan) ────────────────────────────────
_redis_client: aioredis.Redis | None = None


async def init_redis() -> None:
    global _redis_client
    _redis_client = aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        socket_timeout=5,
        socket_connect_timeout=5,
        retry_on_timeout=True,
    )
    await _redis_client.ping()
    logger.info("Redis connection established")


async def close_redis() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
        logger.info("Redis connection closed")


def get_redis() -> aioredis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis client is not initialized. Call init_redis() first.")
    return _redis_client


# ── Cache helpers ─────────────────────────────────────────────────────────────
async def cache_get(key: str) -> Any | None:
    """Return parsed JSON value from cache, or None if missing."""
    client = get_redis()
    try:
        value = await client.get(key)
        return json.loads(value) if value else None
    except Exception as exc:
        logger.warning("Redis GET failed for key %s: %s", key, exc)
        return None


async def cache_set(key: str, value: Any, ttl_seconds: int) -> None:
    """Serialize value to JSON and store in Redis with TTL."""
    client = get_redis()
    try:
        await client.setex(key, ttl_seconds, json.dumps(value))
    except Exception as exc:
        logger.warning("Redis SET failed for key %s: %s", key, exc)


async def get_or_set(key: str, ttl_seconds: int, fetch_fn: Callable) -> Any:
    """
    Cache-aside pattern:
    1. Try Redis cache
    2. On miss: call fetch_fn(), store result, return it
    """
    cached = await cache_get(key)
    if cached is not None:
        logger.debug("Cache HIT: %s", key)
        return cached

    logger.debug("Cache MISS: %s", key)
    data = await fetch_fn()
    await cache_set(key, data, ttl_seconds)
    return data
