import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.modules.alerts import service
from src.modules.auth.dependencies import CurrentUser
from src.modules.alerts.schemas import AlertCreate, AlertListOut, AlertOut

router = APIRouter(prefix="/alerts", tags=["alerts"])


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/", response_model=AlertListOut)
async def list_alerts(
    user: CurrentUser,
    coin_id: str | None = Query(None, description="Filter alerts by coin ID"),
    db: AsyncSession = Depends(get_db),
):
    """List all alerts, optionally filtered by coin."""
    if coin_id:
        alerts = await service.list_alerts_for_coin(db, user.id, coin_id)
    else:
        alerts = await service.list_alerts(db, user.id)
    return AlertListOut(alerts=alerts)


@router.post("/", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
async def create_alert(
    body: AlertCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Create a new price alert."""
    return await service.create_alert(db, user.id, body.coin_id, body.type, body.value)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: uuid.UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Delete a price alert."""
    deleted = await service.delete_alert(db, alert_id, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")
