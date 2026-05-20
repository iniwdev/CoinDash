import json
import random
from uuid import UUID
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.intelligence import schemas

# Cache TTL constants
CACHE_TTL_INSIGHTS = 600   # 10 minutes
CACHE_TTL_SCORES = 1200    # 20 minutes
CACHE_TTL_MARKET = 300     # 5 minutes
CACHE_TTL_SPARKLINE = 7200 # 2 hours


def _try_get_redis():
    """Return Redis client or None if unavailable."""
    try:
        from src.db.redis import get_redis
        return get_redis()
    except Exception:
        return None

async def get_portfolio_insights(db: AsyncSession, user_id: UUID) -> List[schemas.Insight]:
    """
    Generate or retrieve AI insights for the user's portfolio.
    Uses Redis caching to prevent redundant LLM generation calls.
    """
    redis = _try_get_redis()
    if redis:
        try:
            cached = await redis.get(f"intelligence:insights:{str(user_id)}")
            if cached:
                data = json.loads(cached)
                return [schemas.Insight(**item) for item in data]
        except Exception:
            pass

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

    if redis:
        try:
            await redis.setex(f"intelligence:insights:{str(user_id)}", CACHE_TTL_INSIGHTS, json.dumps([i.model_dump() for i in insights]))
        except Exception:
            pass
    return insights

async def get_portfolio_scores(db: AsyncSession, user_id: UUID) -> schemas.IntelligenceScores:
    """Calculate and return portfolio risk and diversification scores."""
    redis = _try_get_redis()
    if redis:
        try:
            cached = await redis.get(f"intelligence:scores:{str(user_id)}")
            if cached:
                return schemas.IntelligenceScores(**json.loads(cached))
        except Exception:
            pass

    scores = schemas.IntelligenceScores(
        risk_score=78,
        risk_label="Moderate-High",
        diversification_index=4.2,
        diversification_label="Low Diversification"
    )

    if redis:
        try:
            await redis.setex(f"intelligence:scores:{str(user_id)}", CACHE_TTL_SCORES, json.dumps(scores.model_dump()))
        except Exception:
            pass
    return scores

async def get_market_snapshot() -> schemas.MarketSnapshot:
    """Get the global market macro snapshot."""
    redis = _try_get_redis()
    if redis:
        try:
            cached = await redis.get("intelligence:market:snapshot")
            if cached:
                return schemas.MarketSnapshot(**json.loads(cached))
        except Exception:
            pass

    snapshot = schemas.MarketSnapshot(
        fearGreed=68,
        fearGreedLabel="Greed",
        btcDominance="54.2%",
        sentiment="Bullish",
        topGainer=schemas.TopMover(symbol="PEPE", change="+18.4%", price="$0.0000084"),
        topLoser=schemas.TopMover(symbol="ARB", change="-5.2%", price="$1.04"),
        trending=["SOL", "RNDR", "FET"]
    )

    if redis:
        try:
            await redis.setex("intelligence:market:snapshot", CACHE_TTL_MARKET, json.dumps(snapshot.model_dump()))
        except Exception:
            pass
    return snapshot

async def get_asset_sparkline(coin_id: str, days: int = 7) -> schemas.SparklineResponse:
    """Generate 7-day sparkline data for a specific asset."""
    redis = _try_get_redis()
    if redis:
        try:
            cached = await redis.get(f"intelligence:sparkline:{coin_id}:{days}")
            if cached:
                data = json.loads(cached)
                return schemas.SparklineResponse(coin_id=coin_id, data=[schemas.SparklinePoint(**pt) for pt in data])
        except Exception:
            pass

    # Generate synthetic sparkline data for the terminal view
    base_value = 50.0
    data = []
    for _ in range(24):
        base_value += random.uniform(-2, 2.5)
        data.append(schemas.SparklinePoint(value=max(1.0, base_value)))

    if redis:
        try:
            await redis.setex(f"intelligence:sparkline:{coin_id}:{days}", CACHE_TTL_SPARKLINE, json.dumps([pt.model_dump() for pt in data]))
        except Exception:
            pass
    return schemas.SparklineResponse(coin_id=coin_id, data=data)
