import asyncio
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.modules.coins.service import get_markets, get_global_data
from src.modules.watchlist.service import list_watchlists
from src.modules.news.service import get_news
from src.modules.portfolio.service import ensure_default_portfolio, get_holdings

logger = logging.getLogger(__name__)

TRUNCATION_BUFFER = 200

# ─────────────────────────────────────────────────────────────────────────────
# Prompt engineering
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT: str = """
You are CoinDash AI, a premium crypto market assistant, portfolio helper, and fintech educator. Your tone is modern, intelligent, and highly professional—a blend of Bloomberg's analytical sharpness, Binance Academy's educational clarity, and ChatGPT's conversational helpfulness.

CORE DIRECTIVES:
1. EDUCATE WITH CLARITY: Explain complex crypto concepts (like DeFi, staking, Layer 2s, or Bitcoin dominance) simply, without overwhelming jargon. Be beginner-friendly but never condescending.
2. NO FINANCIAL ADVICE: You are NOT a financial advisor. NEVER guarantee returns, predict exact prices, or tell users what to buy or sell. Use phrases like "Historically...", "Market analysts suggest...", or "Some investors consider...".
3. HIGHLIGHT RISK & VOLATILITY: Always contextualize crypto markets with their inherent volatility. Emphasize risk management principles like diversification and thorough research (DYOR).
4. DATA-DRIVEN & CONCISE: Keep answers tight, structured, and insightful. Avoid unnecessary fluff or overly long preambles.
5. NO HALLUCINATIONS: If you lack real-time data or cannot verify current market conditions, state so clearly. Do not invent metrics, prices, or events.

FORMATTING RULES:
- Use plain text only.
- NEVER use markdown tables, headings (###), bolding (**), or bullet points.
- Keep responses conversational, fluid, and easy to read in a small chat window.
- Do not cut off mid-thought; continue until your explanation is complete.
- Do not generate long articles.

Always behave like a real, intelligent, and safe AI chat assistant.
""".strip()


async def build_prompt(user_id: Optional[uuid.UUID], message: str, db: AsyncSession) -> List[Dict[str, str]]:
    """Builds a context-aware prompt using live market data and user context."""
    
    # 1. Fetch Market Data concurrently
    async def fetch_market() -> dict:
        try:
            # We use get_markets which uses httpx and Redis caching internally
            btc_eth_task = get_markets(ids="bitcoin,ethereum", per_page=2, sparkline=False)
            trending_task = get_markets(per_page=5, sparkline=False)
            global_task = get_global_data()
            
            btc_eth, trending, global_data = await asyncio.gather(
                btc_eth_task, trending_task, global_task, return_exceptions=True
            )
            
            prices = {}
            if not isinstance(btc_eth, Exception):
                prices = {c["id"]: c.get("current_price", 0) for c in btc_eth}
                
            cap = 0
            if not isinstance(global_data, Exception):
                cap = global_data.get("total_market_cap", {}).get("usd", 0)
                
            top_trending = []
            if not isinstance(trending, Exception):
                top_trending = [c["symbol"].upper() for c in trending]
                
            return {
                "btc": prices.get("bitcoin", 0),
                "eth": prices.get("ethereum", 0),
                "cap": cap,
                "trending": top_trending
            }
        except Exception as e:
            logger.error(f"Error fetching market data for AI context: {e}")
            return {"btc": 0, "eth": 0, "cap": 0, "trending": []}

    # 2. Fetch Watchlist
    async def fetch_watchlist() -> list[str]:
        if not user_id:
            return []
        try:
            watchlists = await list_watchlists(db, user_id)
            coins = []
            for wl in watchlists:
                for coin in wl.coins:
                    coins.append(coin.coin_id)
            return list(set(coins))
        except Exception as e:
            logger.error(f"Error fetching watchlist for AI context: {e}")
            return []

    # 3. Fetch News
    async def fetch_news() -> list[str]:
        try:
            news_data = await get_news("bitcoin")
            articles = news_data.get("articles", [])
            return [a.get("title") for a in articles[:3]]
        except Exception as e:
            logger.error(f"Error fetching news for AI context: {e}")
            return []

    # 4. Fetch Portfolio
    async def fetch_portfolio_text() -> str:
        if not user_id:
            return "No portfolio linked."
        try:
            default_pf = await ensure_default_portfolio(db, user_id)
            holdings = await get_holdings(db, default_pf.id, user_id)
            if not holdings:
                return "Portfolio is empty."
            lines = []
            for h in holdings:
                lines.append(f"{h['quantity']} {h['coin_symbol']} (Value: ${h['current_value']}, PnL: {h['unrealized_pnl_pct']}%)")
            return ", ".join(lines)
        except Exception as e:
            logger.error(f"Error fetching portfolio for AI context: {e}")
            return "Portfolio data unavailable."

    # Run all context fetchers concurrently
    market, watchlist_coins, news_summaries, portfolio_text = await asyncio.gather(
        fetch_market(),
        fetch_watchlist(),
        fetch_news(),
        fetch_portfolio_text(),
    )

    # Assemble Context Block
    cap_billions = market['cap'] / 1e9 if market['cap'] else 0
    
    context_block = f"""
    Market snapshot (UTC {datetime.now(timezone.utc).strftime('%H:%M')}):
    • BTC: ${market['btc']:.2f}
    • ETH: ${market['eth']:.2f}
    • Total market cap: ${cap_billions:.2f} B
    • Trending: {', '.join(market['trending']) if market['trending'] else 'unavailable'}

    Your watchlist: {', '.join(watchlist_coins) if watchlist_coins else 'none'}
    Your portfolio holdings: {portfolio_text}

    Latest crypto news headlines:
    {chr(10).join(f"• {n}" for n in news_summaries) if news_summaries else 'unavailable'}
    """.strip()
    
    # Token Truncation Safety
    # A rough heuristic: 1 token ≈ 4 characters
    approx_tokens = (len(context_block) + len(SYSTEM_PROMPT)) // 4
    if approx_tokens > (settings.ai_max_tokens - TRUNCATION_BUFFER):
        half = (settings.ai_max_tokens - TRUNCATION_BUFFER) // 2
        context_block = context_block[:half * 4] + "\n...[truncated]...\n" + context_block[-half * 4 :]

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": context_block},
        {"role": "user", "content": message}
    ]
