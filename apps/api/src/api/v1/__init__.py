"""
API v1 router aggregator.

Import all sub-routers here and register them on `v1_router`.
This keeps main.py clean — it only needs one include_router call per version.

Usage in main.py:
    from src.api.v1 import v1_router
    app.include_router(v1_router, prefix="/api/v1")

NOTE: Currently routers are imported directly from modules to preserve
      existing behaviour during migration. This file is the target state
      once all modules are ported to the new structure.
"""

from fastapi import APIRouter

# Future: uncomment as modules are migrated
# from src.modules.auth.router import router as auth_router
# from src.modules.coins.router import router as coins_router
# from src.modules.portfolio.router import router as portfolio_router
# from src.modules.alerts.router import router as alerts_router
# from src.modules.news.router import router as news_router

v1_router = APIRouter()

# v1_router.include_router(auth_router)
# v1_router.include_router(coins_router)
# v1_router.include_router(portfolio_router)
# v1_router.include_router(alerts_router)
# v1_router.include_router(news_router)
