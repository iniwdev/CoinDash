import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.modules.alerts import service
from src.modules.alerts.schemas import AlertCreate, AlertListOut, AlertOut

router = APIRouter(prefix="/alerts", tags=["alerts"])

# ── Mock Auth Dependency ──────────────────────────────────────────────────────
# TODO: Replace with real JWT auth in Phase 4.5
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


async def get_current_user_id() -> str:
    return MOCK_USER_ID


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/", response_model=AlertListOut)
async def list_alerts(
    coin_id: str | None = Query(None, description="Filter alerts by coin ID"),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """List all alerts, optionally filtered by coin."""
    if coin_id:
        alerts = await service.list_alerts_for_coin(db, user_id, coin_id)
    else:
        alerts = await service.list_alerts(db, user_id)
    return AlertListOut(alerts=alerts)


@router.post("/", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
async def create_alert(
    body: AlertCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Create a new price alert."""
    return await service.create_alert(db, user_id, body.coin_id, body.type, body.value)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Delete a price alert."""
    deleted = await service.delete_alert(db, alert_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")
