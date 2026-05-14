import logging
import uuid

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.alerts.models import Alert
from src.db.redis import get_redis

logger = logging.getLogger(__name__)


async def _invalidate_cache(user_id: uuid.UUID) -> None:
    try:
        client = get_redis()
        await client.delete(f"alerts:user:{user_id}")
    except Exception as exc:
        logger.warning("Redis alert cache invalidation failed (non-fatal): %s", exc)


# ── CRUD ──────────────────────────────────────────────────────────────────────
async def list_alerts(db: AsyncSession, user_id: uuid.UUID) -> list[Alert]:
    result = await db.execute(
        select(Alert)
        .where(Alert.user_id == user_id)
        .order_by(Alert.created_at.desc())
    )
    return list(result.scalars().all())


async def list_alerts_for_coin(db: AsyncSession, user_id: uuid.UUID, coin_id: str) -> list[Alert]:
    result = await db.execute(
        select(Alert)
        .where(Alert.user_id == user_id, Alert.coin_id == coin_id)
        .order_by(Alert.created_at.desc())
    )
    return list(result.scalars().all())


async def create_alert(db: AsyncSession, user_id: uuid.UUID, coin_id: str, type: str, value: float) -> Alert:
    alert = Alert(user_id=user_id, coin_id=coin_id, type=type, value=value)
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    await _invalidate_cache(user_id)
    return alert


async def delete_alert(db: AsyncSession, alert_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == user_id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        return False
    await db.delete(alert)
    await db.flush()
    await _invalidate_cache(user_id)
    return True
