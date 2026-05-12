from fastapi import APIRouter

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/")
async def portfolio_stub():
    """Portfolio module — coming in Phase 4.7."""
    return {"message": "Portfolio module coming soon", "status": "stub"}
