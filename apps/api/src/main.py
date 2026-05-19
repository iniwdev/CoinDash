from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.logging import get_logger, setup_logging
from src.db.redis import close_redis, get_redis, init_redis
from src.modules.ai.router import router as ai_router
from src.modules.alerts.router import router as alerts_router
from src.modules.auth.router import router as auth_router
from src.modules.coins.router import router as coins_router
from src.modules.news.router import router as news_router
from src.modules.portfolio.router import router as portfolio_router
from src.modules.watchlist.router import router as watchlist_router

# ── Configure logging before anything else ────────────────────────────────────
setup_logging()
logger = get_logger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    logger.info("CoinDash API starting up — env=%s", settings.app_env)

    try:
        await init_redis()
        logger.info("Redis: connected ✓")
    except Exception as exc:
        logger.warning("Redis unavailable (non-fatal in dev): %s", exc)

    yield  # ← app is live here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("CoinDash API shutting down...")
    await close_redis()
    logger.info("Shutdown complete.")


# ── App factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title="CoinDash AI API",
        version="1.0.0",
        description="Production-grade crypto portfolio backend",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Healthcheck ───────────────────────────────────────────────────────────
    @app.get("/health", tags=["ops"], summary="Liveness + dependency probe")
    async def health():
        """
        Returns service status and dependency health.

        Checks:
        - API process (always ok if reachable)
        - Redis ping (non-fatal — degrades gracefully)
        - PostgreSQL (checked lazily via session; skipped here to stay lightweight)

        Use /health/ready for a full readiness probe before load-balancer registration.
        """
        checks: dict[str, str] = {}

        # Redis probe
        try:
            client = get_redis()
            await client.ping()
            checks["redis"] = "ok"
        except Exception as exc:
            checks["redis"] = f"degraded: {exc}"

        overall = "ok" if all(v == "ok" for v in checks.values()) else "degraded"

        return {
            "status": overall,
            "version": "1.0.0",
            "env": settings.app_env,
            "checks": checks,
        }

    @app.get("/health/ready", tags=["ops"], summary="Full readiness probe (DB + Redis)")
    async def readiness():
        """
        Full readiness check — use this for Kubernetes readiness probes.
        Checks both Redis and PostgreSQL connectivity.
        """
        from sqlalchemy import text
        from src.db.session import AsyncSessionLocal

        checks: dict[str, str] = {}

        # Redis
        try:
            client = get_redis()
            await client.ping()
            checks["redis"] = "ok"
        except Exception as exc:
            checks["redis"] = f"error: {exc}"

        # PostgreSQL
        try:
            async with AsyncSessionLocal() as session:
                await session.execute(text("SELECT 1"))
            checks["postgres"] = "ok"
        except Exception as exc:
            checks["postgres"] = f"error: {exc}"

        all_ok = all(v == "ok" for v in checks.values())
        return {
            "status": "ready" if all_ok else "not_ready",
            "checks": checks,
        }

    # ── v1 Routers ────────────────────────────────────────────────────────────
    API_PREFIX = "/api/v1"
    app.include_router(ai_router,        prefix=API_PREFIX)
    app.include_router(auth_router,      prefix=API_PREFIX)
    app.include_router(coins_router,     prefix=API_PREFIX)
    app.include_router(news_router,      prefix=API_PREFIX)
    app.include_router(portfolio_router, prefix=API_PREFIX)
    app.include_router(alerts_router,    prefix=API_PREFIX)
    app.include_router(watchlist_router, prefix=API_PREFIX)

    return app


app = create_app()
