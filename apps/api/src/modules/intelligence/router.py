from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.modules.auth.dependencies import CurrentUser
from src.modules.intelligence import service, schemas

router = APIRouter(tags=["intelligence"])

@router.get(
    "/portfolio/intelligence/insights",
    response_model=List[schemas.Insight],
    summary="Get AI-generated portfolio insights"
)
async def get_insights(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Generate dynamic AI insights about the user's portfolio."""
    return await service.get_portfolio_insights(db, current_user.id)

@router.get(
    "/portfolio/intelligence/scores",
    response_model=schemas.IntelligenceScores,
    summary="Get portfolio risk and diversification scores"
)
async def get_scores(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the risk and diversification index scores."""
    return await service.get_portfolio_scores(db, current_user.id)

@router.get(
    "/market/snapshot",
    response_model=schemas.MarketSnapshot,
    summary="Get global market snapshot"
)
async def get_market_snapshot():
    """Retrieve the global Fear & Greed index, dominance, and top movers."""
    return await service.get_market_snapshot()

@router.get(
    "/assets/{coin_id}/sparkline",
    response_model=schemas.SparklineResponse,
    summary="Get 7-day sparkline data for an asset"
)
async def get_sparkline(coin_id: str, days: int = 7):
    """Get synthetic sparkline data for the terminal holdings table."""
    return await service.get_asset_sparkline(coin_id, days)
