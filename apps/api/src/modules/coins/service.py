import logging
import httpx

from src.core.exceptions import ExternalAPIError
from src.db.redis import get_or_set

logger = logging.getLogger(__name__)

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
MARKET_CACHE_TTL = 300      # 5 minutes
CHART_CACHE_TTL = 300       # 5 minutes
EXCHANGE_CACHE_TTL = 1800   # 30 minutes (exchanges don't change as fast as prices)

# ── Legacy Mock Data Fallback ────────────────────────────────────────────────
def _get_mock_market_data(limit: int = 20) -> list[dict]:
    """Fallback data when CoinGecko rate limits (429). Ported from legacy API."""
    mock_coins = [
        { "id": 'bitcoin', "symbol": 'btc', "name": 'Bitcoin', "current_price": 67234.50, "market_cap": 1324567890000, "total_volume": 34234890123, "price_change_percentage_24h_in_currency": 2.45, "price_change_percentage_24h": 2.45, "price_change_24h": 1234.56 },
        { "id": 'ethereum', "symbol": 'eth', "name": 'Ethereum', "current_price": 3456.78, "market_cap": 415678901234, "total_volume": 23456789012, "price_change_percentage_24h_in_currency": -1.23, "price_change_percentage_24h": -1.23, "price_change_24h": -42.34 },
        { "id": 'binancecoin', "symbol": 'bnb', "name": 'Binance Coin', "current_price": 612.34, "market_cap": 93456789012, "total_volume": 1234567890, "price_change_percentage_24h_in_currency": 0.56, "price_change_percentage_24h": 0.56, "price_change_24h": 3.45 },
        { "id": 'ripple', "symbol": 'xrp', "name": 'Ripple', "current_price": 2.45, "market_cap": 130456789012, "total_volume": 2345678901, "price_change_percentage_24h_in_currency": 3.21, "price_change_percentage_24h": 3.21, "price_change_24h": 0.07 },
        { "id": 'solana', "symbol": 'sol', "name": 'Solana', "current_price": 145.67, "market_cap": 61234567890, "total_volume": 3456789012, "price_change_percentage_24h_in_currency": -2.34, "price_change_percentage_24h": -2.34, "price_change_24h": -3.45 },
        { "id": 'cardano', "symbol": 'ada', "name": 'Cardano', "current_price": 0.98, "market_cap": 35234567890, "total_volume": 456789012, "price_change_percentage_24h_in_currency": 1.23, "price_change_percentage_24h": 1.23, "price_change_24h": 0.01 },
        { "id": 'dogecoin', "symbol": 'doge', "name": 'Dogecoin', "current_price": 0.34, "market_cap": 49234567890, "total_volume": 6789012345, "price_change_percentage_24h_in_currency": -0.45, "price_change_percentage_24h": -0.45, "price_change_24h": -0.001 },
        { "id": 'polkadot', "symbol": 'dot', "name": 'Polkadot', "current_price": 7.89, "market_cap": 10234567890, "total_volume": 345678901, "price_change_percentage_24h_in_currency": 2.15, "price_change_percentage_24h": 2.15, "price_change_24h": 0.16 },
        { "id": 'polygon', "symbol": 'matic', "name": 'Polygon', "current_price": 0.56, "market_cap": 5234567890, "total_volume": 234567890, "price_change_percentage_24h_in_currency": 1.67, "price_change_percentage_24h": 1.67, "price_change_24h": 0.009 },
        { "id": 'avalanche-2', "symbol": 'avax', "name": 'Avalanche', "current_price": 34.56, "market_cap": 12234567890, "total_volume": 567890123, "price_change_percentage_24h_in_currency": -1.89, "price_change_percentage_24h": -1.89, "price_change_24h": -0.67 },
        { "id": 'chainlink', "symbol": 'link', "name": 'Chainlink', "current_price": 28.90, "market_cap": 13456789012, "total_volume": 789012345, "price_change_percentage_24h_in_currency": 3.45, "price_change_percentage_24h": 3.45, "price_change_24h": 0.96 },
        { "id": 'uniswap', "symbol": 'uni', "name": 'Uniswap', "current_price": 15.67, "market_cap": 5789012345, "total_volume": 234567890, "price_change_percentage_24h_in_currency": 2.34, "price_change_percentage_24h": 2.34, "price_change_24h": 0.36 },
        { "id": 'litecoin', "symbol": 'ltc', "name": 'Litecoin', "current_price": 89.23, "market_cap": 11234567890, "total_volume": 456789012, "price_change_percentage_24h_in_currency": 0.78, "price_change_percentage_24h": 0.78, "price_change_24h": 0.70 },
        { "id": 'stellar', "symbol": 'xlm', "name": 'Stellar', "current_price": 0.123, "market_cap": 3234567890, "total_volume": 123456789, "price_change_percentage_24h_in_currency": 1.34, "price_change_percentage_24h": 1.34, "price_change_24h": 0.0016 },
        { "id": 'monero', "symbol": 'xmr', "name": 'Monero', "current_price": 167.45, "market_cap": 2934567890, "total_volume": 89012345, "price_change_percentage_24h_in_currency": -2.12, "price_change_percentage_24h": -2.12, "price_change_24h": -3.65 },
        { "id": 'cosmos', "symbol": 'atom', "name": 'Cosmos', "current_price": 9.87, "market_cap": 2834567890, "total_volume": 156789012, "price_change_percentage_24h_in_currency": 1.95, "price_change_percentage_24h": 1.95, "price_change_24h": 0.19 },
        { "id": 'helium', "symbol": 'hnt', "name": 'Helium', "current_price": 8.56, "market_cap": 1234567890, "total_volume": 89012345, "price_change_percentage_24h_in_currency": -1.56, "price_change_percentage_24h": -1.56, "price_change_24h": -0.13 },
        { "id": 'near', "symbol": 'near', "name": 'NEAR Protocol', "current_price": 7.34, "market_cap": 1123456789, "total_volume": 234567890, "price_change_percentage_24h_in_currency": 2.45, "price_change_percentage_24h": 2.45, "price_change_24h": 0.18 },
        { "id": 'aptos', "symbol": 'apt', "name": 'Aptos', "current_price": 12.45, "market_cap": 1023456789, "total_volume": 345678901, "price_change_percentage_24h_in_currency": -0.89, "price_change_percentage_24h": -0.89, "price_change_24h": -0.11 },
        { "id": 'sui', "symbol": 'sui', "name": 'Sui', "current_price": 4.56, "market_cap": 834567890, "total_volume": 456789012, "price_change_percentage_24h_in_currency": 3.67, "price_change_percentage_24h": 3.67, "price_change_24h": 0.16 },
    ]
    return mock_coins[:limit]


def _get_mock_exchange_data(limit: int = 20) -> list[dict]:
    """Fallback exchange data for rate limiting. Ported from legacy API."""
    mock_exchanges = [
        {"id": "binance", "name": "Binance", "year_established": 2017, "country": "Cayman Islands", "url": "https://www.binance.com", "image": "https://assets.coingecko.com/markets/images/52/small/binance.jpg", "trust_score": 10, "trust_score_rank": 1, "trade_volume_24h_btc": 245678.12, "trade_volume_24h_btc_normalized": 245678.12},
        {"id": "coinbase_exchange", "name": "Coinbase Exchange", "year_established": 2012, "country": "United States", "url": "https://www.coinbase.com", "image": "https://assets.coingecko.com/markets/images/23/small/Coinbase_Exchange_Coin_Icon.png", "trust_score": 10, "trust_score_rank": 2, "trade_volume_24h_btc": 45678.34, "trade_volume_24h_btc_normalized": 45678.34},
        {"id": "kraken", "name": "Kraken", "year_established": 2011, "country": "United States", "url": "https://www.kraken.com", "image": "https://assets.coingecko.com/markets/images/29/small/kraken.jpg", "trust_score": 10, "trust_score_rank": 3, "trade_volume_24h_btc": 23456.78, "trade_volume_24h_btc_normalized": 23456.78},
        {"id": "kucoin", "name": "KuCoin", "year_established": 2017, "country": "Seychelles", "url": "https://www.kucoin.com", "image": "https://assets.coingecko.com/markets/images/61/small/kucoin.jpg", "trust_score": 10, "trust_score_rank": 4, "trade_volume_24h_btc": 18901.23, "trade_volume_24h_btc_normalized": 18901.23},
        {"id": "bybit_spot", "name": "Bybit", "year_established": 2018, "country": "British Virgin Islands", "url": "https://www.bybit.com", "image": "https://assets.coingecko.com/markets/images/698/small/bybit_spot.png", "trust_score": 10, "trust_score_rank": 5, "trade_volume_24h_btc": 15678.90, "trade_volume_24h_btc_normalized": 15678.90},
        {"id": "okex", "name": "OKX", "year_established": 2017, "country": "Seychelles", "url": "https://www.okx.com", "image": "https://assets.coingecko.com/markets/images/96/small/okx.png", "trust_score": 10, "trust_score_rank": 6, "trade_volume_24h_btc": 12345.67, "trade_volume_24h_btc_normalized": 12345.67},
        {"id": "gate", "name": "Gate.io", "year_established": 2013, "country": "Hong Kong", "url": "https://www.gate.io", "image": "https://assets.coingecko.com/markets/images/60/small/gate_io.png", "trust_score": 10, "trust_score_rank": 7, "trade_volume_24h_btc": 9876.54, "trade_volume_24h_btc_normalized": 9876.54},
        {"id": "huobi", "name": "HTX", "year_established": 2013, "country": "Seychelles", "url": "https://www.htx.com", "image": "https://assets.coingecko.com/markets/images/25/small/HTX.png", "trust_score": 10, "trust_score_rank": 8, "trade_volume_24h_btc": 8765.43, "trade_volume_24h_btc_normalized": 8765.43},
        {"id": "crypto_com", "name": "Crypto.com Exchange", "year_established": 2019, "country": "Malta", "url": "https://exchange.crypto.com", "image": "https://assets.coingecko.com/markets/images/589/small/crypto_com.jpg", "trust_score": 10, "trust_score_rank": 9, "trade_volume_24h_btc": 7654.32, "trade_volume_24h_btc_normalized": 7654.32},
        {"id": "bitfinex", "name": "Bitfinex", "year_established": 2012, "country": "British Virgin Islands", "url": "https://www.bitfinex.com", "image": "https://assets.coingecko.com/markets/images/4/small/bitfinex.jpg", "trust_score": 10, "trust_score_rank": 10, "trade_volume_24h_btc": 6543.21, "trade_volume_24h_btc_normalized": 6543.21},
    ]
    return mock_exchanges[:limit]


# ── Services ─────────────────────────────────────────────────────────────────
async def get_markets(
    vs_currency: str = "usd",
    order: str = "market_cap_desc",
    per_page: int = 100,
    page: int = 1,
    sparkline: bool = True,
    price_change_percentage: str = "1h,24h,7d",
    ids: str | None = None,
) -> list[dict]:
    """
    Transparent proxy to CoinGecko's /coins/markets endpoint.
    Maintains exact legacy response contract for frontend compatibility.
    """
    cache_key = f"coins-markets-{vs_currency}-{order}-{per_page}-{page}-{sparkline}-{price_change_percentage}-{ids or ''}"

    async def fetch() -> list[dict]:
        try:
            params = {
                "vs_currency": vs_currency,
                "order": order,
                "per_page": per_page,
                "page": page,
                "sparkline": "true" if sparkline else "false",
                "price_change_percentage": price_change_percentage,
            }
            if ids:
                params["ids"] = ids
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"{COINGECKO_BASE}/coins/markets",
                    params=params,
                )
            if resp.status_code == 429:
                logger.warning("CoinGecko markets rate limited. Returning mock data.")
                return _get_mock_market_data(per_page)
                
            resp.raise_for_status()
            return resp.json()
            
        except httpx.HTTPStatusError as exc:
            logger.error("CoinGecko API error: %s", exc)
            return _get_mock_market_data(per_page)
        except Exception as exc:
            logger.error("Market proxy error: %s", exc)
            return _get_mock_market_data(per_page)

    return await get_or_set(cache_key, MARKET_CACHE_TTL, fetch)


async def get_coin_chart(
    coin_id: str,
    vs_currency: str = "usd",
    days: int | str = 7,
    interval: str | None = None,
) -> dict:
    """
    Transparent proxy to CoinGecko's /coins/{id}/market_chart endpoint.
    """
    cache_key = f"{coin_id}-{vs_currency}-{days}-{interval or ''}"

    async def fetch() -> dict:
        try:
            params: dict = {"vs_currency": vs_currency, "days": days}
            if interval:
                params["interval"] = interval
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"{COINGECKO_BASE}/coins/{coin_id}/market_chart",
                    params=params,
                )
            if resp.status_code == 429:
                # The legacy API threw an error or served stale cache.
                # get_or_set handles stale cache internally, but on first failure we must throw.
                raise ExternalAPIError("Rate limited by CoinGecko API")
                
            resp.raise_for_status()
            return resp.json()
            
        except ExternalAPIError:
            raise
        except httpx.HTTPStatusError as exc:
            raise ExternalAPIError(f"CoinGecko API error: {exc.response.status_code}") from exc
        except Exception as exc:
            raise ExternalAPIError("Failed to fetch market chart data") from exc

    return await get_or_set(cache_key, CHART_CACHE_TTL, fetch)


async def get_exchanges(per_page: int = 100, page: int = 1) -> list[dict]:
    """
    Proxy to CoinGecko's /exchanges endpoint.
    """
    cache_key = f"exchanges-{per_page}-{page}"

    async def fetch() -> list[dict]:
        try:
            params = {"per_page": per_page, "page": page}
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{COINGECKO_BASE}/exchanges", params=params)
            
            if resp.status_code == 429:
                logger.warning("CoinGecko exchanges rate limited. Returning mock data.")
                return _get_mock_exchange_data(per_page)
                
            resp.raise_for_status()
            return resp.json()
            
        except Exception as exc:
            logger.error("Exchanges proxy error: %s", exc)
            return _get_mock_exchange_data(per_page)

    return await get_or_set(cache_key, EXCHANGE_CACHE_TTL, fetch)
