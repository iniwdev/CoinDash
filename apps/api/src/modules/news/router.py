from fastapi import APIRouter, Query

from src.modules.news import service
from src.modules.news.schemas import NewsResponse

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/", response_model=NewsResponse)
async def get_news(coin: str = Query(..., description="Coin name, e.g. 'bitcoin'")):
    """Fetch aggregated crypto news for a given coin. Mirrors legacy /api/news?coin=."""
    return await service.get_news(coin)
