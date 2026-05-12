import asyncio
import logging
import re
from typing import Any

import feedparser

from src.db.redis import get_or_set

logger = logging.getLogger(__name__)

NEWS_FEEDS = [
    {"url": "https://cointelegraph.com/rss", "source": "Cointelegraph"},
    {"url": "https://decrypt.co/feed", "source": "Decrypt"},
    {"url": "https://www.coindesk.com/arc/outboundfeeds/rss/", "source": "CoinDesk"},
    {"url": "https://www.newsbtc.com/feed", "source": "NewsBTC"},
]

GENERAL_CRYPTO_PATTERN = re.compile(
    r"crypto|cryptocurrency|blockchain|defi|nft|exchange|token|coin", re.IGNORECASE
)

COIN_SYNONYMS: dict[str, list[str]] = {
    "bitcoin": ["bitcoin", "btc"],
    "ethereum": ["ethereum", "eth"],
    "solana": ["solana", "sol"],
}

NEWS_CACHE_TTL = 600  # 10 minutes


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string and normalize whitespace."""
    if not text:
        return ""
    # Remove script and style elements
    text = re.sub(r"<(script|style).*?>.*?</\1>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove remaining tags
    text = re.sub(r"<.*?>", "", text)
    # Decode basic entities (could use html.unescape if needed)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    # Normalize whitespace
    return " ".join(text.split())


def _parse_feed(url: str, source: str) -> list[dict]:
    """Parse RSS feed synchronously (feedparser is sync-only)."""
    try:
        feed = feedparser.parse(url)
        articles = []
        for entry in feed.entries:
            image = None
            if hasattr(entry, "media_content") and entry.media_content:
                image = entry.media_content[0].get("url")
            elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                image = entry.media_thumbnail[0].get("url")
            elif hasattr(entry, "enclosures") and entry.enclosures:
                image = entry.enclosures[0].get("href")

            articles.append({
                "title": _strip_html(getattr(entry, "title", "Untitled")).strip(),
                "description": _strip_html(getattr(entry, "summary", "") or "").strip(),
                "source": getattr(entry, "author", source),
                "date": getattr(entry, "published", "") or getattr(entry, "updated", ""),
                "link": getattr(entry, "link", None),
                "image": image,
            })
        return articles
    except Exception as exc:
        logger.warning("Feed failed (%s): %s", url, exc)
        return []


def _matches_coin(text: str, coin_name: str) -> bool:
    normalized = text.lower()
    coin_lower = coin_name.lower()
    synonyms = COIN_SYNONYMS.get(coin_lower, [coin_lower])
    return any(s in normalized for s in synonyms)


def _deduplicate(articles: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out = []
    for a in articles:
        key = f"{a.get('link', '')}:{a.get('title', '')}"
        if key not in seen:
            seen.add(key)
            out.append(a)
    return out


async def get_news(coin_name: str) -> dict[str, Any]:
    cache_key = f"news:{coin_name.lower()}"

    async def fetch() -> dict[str, Any]:
        # Run synchronous feedparser calls in a thread pool
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(None, _parse_feed, feed["url"], feed["source"])
            for feed in NEWS_FEEDS
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_articles = []
        for result in results:
            if isinstance(result, list):
                all_articles.extend(result)

        # Filter to coin-specific articles first, fall back to general crypto
        coin_specific = [
            a for a in all_articles
            if _matches_coin(f"{a['title']} {a['description']}", coin_name)
        ]
        general = [
            a for a in all_articles
            if GENERAL_CRYPTO_PATTERN.search(f"{a['title']} {a['description']}")
        ]

        final = _deduplicate(coin_specific if coin_specific else general)[:30]

        if not final:
            return {"articles": [], "message": "No news found for this coin."}

        return {"articles": final}

    return await get_or_set(cache_key, NEWS_CACHE_TTL, fetch)
