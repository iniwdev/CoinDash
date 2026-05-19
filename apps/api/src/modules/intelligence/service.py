import json
import random
from uuid import UUID
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.redis import get_redis
from src.modules.intelligence import schemas

# Cache TTL constants
CACHE_TTL_INSIGHTS = 300  # 5 minutes
CACHE_TTL_SCORES = 600    # 10 minutes
CACHE_TTL_MARKET = 60     # 1 minute
CACHE_TTL_SPARKLINE = 3600 # 1 hour

async def get_portfolio_insights(db: AsyncSession, user_id: UUID) -> List[schemas.Insight]:
    """
    Generate or retrieve AI insights for the user's portfolio.
    Uses Redis caching to prevent redundant LLM generation calls.
    """
    redis = get_redis()
    cache_key = f"intelligence:insights:{str(user_id)}"
    
    cached = await redis.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [schemas.Insight(**item) for item in data]

    # In production, this would query the portfolio holdings and pass them to an LLM chain.
    # For now, we generate a highly relevant mock response based on the frontend's needs.
    insights = [
        schemas.Insight(
            id="ins_1",
            type="WARNING",
            title="High Concentration Risk",
            summary="BTC dominates 92% of your portfolio.",
            details="Your portfolio is heavily skewed towards Bitcoin. While BTC is a blue-chip asset, allocating 10-15% to high-momentum Layer 1 altcoins could significantly optimize your Sharpe ratio.",
            action="Diversify Now",
            color="from-rose-500 to-orange-500",
            icon="⚠️"
        ),
        schemas.Insight(
            id="ins_2",
            type="OPPORTUNITY",
            title="Momentum Shift Detected",
            summary="SOL momentum is increasing rapidly.",
            details="Institutional inflow metrics and on-chain DEX volumes suggest a strong bullish continuation for Solana. Key resistance at $165 has been flipped to support.",
            action="Trade SOL",
            color="from-violet-500 to-fuchsia-500",
            icon="⚡"
        )
    ]
    
    await redis.setex(cache_key, CACHE_TTL_INSIGHTS, json.dumps([i.model_dump() for i in insights]))
    return insights

async def get_portfolio_scores(db: AsyncSession, user_id: UUID) -> schemas.IntelligenceScores:
    """Calculate and return portfolio risk and diversification scores."""
    redis = get_redis()
    cache_key = f"intelligence:scores:{str(user_id)}"
    
    cached = await redis.get(cache_key)
    if cached:
        return schemas.IntelligenceScores(**json.loads(cached))

    scores = schemas.IntelligenceScores(
        risk_score=78,
        risk_label="Moderate-High",
        diversification_index=4.2,
        diversification_label="Low Diversification"
    )
    
    await redis.setex(cache_key, CACHE_TTL_SCORES, json.dumps(scores.model_dump()))
    return scores

async def get_market_snapshot() -> schemas.MarketSnapshot:
    """Get the global market macro snapshot."""
    redis = get_redis()
    cache_key = "intelligence:market:snapshot"
    
    cached = await redis.get(cache_key)
    if cached:
        return schemas.MarketSnapshot(**json.loads(cached))

    snapshot = schemas.MarketSnapshot(
        fearGreed=68,
        fearGreedLabel="Greed",
        btcDominance="54.2%",
        sentiment="Bullish",
        topGainer=schemas.TopMover(symbol="PEPE", change="+18.4%", price="$0.0000084"),
        topLoser=schemas.TopMover(symbol="ARB", change="-5.2%", price="$1.04"),
        trending=["SOL", "RNDR", "FET"]
    )
    
    await redis.setex(cache_key, CACHE_TTL_MARKET, json.dumps(snapshot.model_dump()))
    return snapshot

async def get_asset_sparkline(coin_id: str, days: int = 7) -> schemas.SparklineResponse:
    """Generate 7-day sparkline data for a specific asset."""
    redis = get_redis()
    cache_key = f"intelligence:sparkline:{coin_id}:{days}"
    
    cached = await redis.get(cache_key)
    if cached:
        data = json.loads(cached)
        return schemas.SparklineResponse(coin_id=coin_id, data=[schemas.SparklinePoint(**pt) for pt in data])

    # Generate synthetic sparkline data for the terminal view
    base_value = 50.0
    data = []
    for _ in range(24):
        base_value += random.uniform(-2, 2.5)
        data.append(schemas.SparklinePoint(value=max(1.0, base_value)))

    await redis.setex(cache_key, CACHE_TTL_SPARKLINE, json.dumps([pt.model_dump() for pt in data]))
    return schemas.SparklineResponse(coin_id=coin_id, data=data)
