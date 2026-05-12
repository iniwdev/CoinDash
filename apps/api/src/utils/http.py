"""
Shared async HTTP client (httpx).

Provides a single reusable httpx.AsyncClient with sane defaults:
  - Timeout: 10s connect, 30s read
  - Automatic retries are NOT built in here (use tenacity at the call site)
  - Raises httpx.HTTPStatusError on 4xx/5xx by default

Usage:
    from src.utils.http import http_client

    async with http_client() as client:
        resp = await client.get("https://api.example.com/data")
        resp.raise_for_status()
        return resp.json()

For module-level persistent clients (e.g. CoinGecko), keep one instance
per service and close it in the lifespan shutdown.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import httpx

DEFAULT_TIMEOUT = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=5.0)
DEFAULT_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "CoinDash-API/1.0",
}


@asynccontextmanager
async def http_client(
    base_url: str = "",
    headers: dict | None = None,
    timeout: httpx.Timeout = DEFAULT_TIMEOUT,
) -> AsyncGenerator[httpx.AsyncClient, None]:
    """Context-managed httpx client with CoinDash defaults."""
    merged_headers = {**DEFAULT_HEADERS, **(headers or {})}
    async with httpx.AsyncClient(
        base_url=base_url,
        headers=merged_headers,
        timeout=timeout,
        follow_redirects=True,
    ) as client:
        yield client
