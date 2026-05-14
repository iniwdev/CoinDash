import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.modules.auth.dependencies import CurrentUser
from src.modules.watchlist import service
from src.modules.watchlist.schemas import (
    WatchlistAddCoin,
    WatchlistCreate,
    WatchlistListOut,
    WatchlistOut,
    WatchlistRename,
)

router = APIRouter(prefix="/watchlists", tags=["watchlists"])


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/", response_model=WatchlistListOut)
async def list_watchlists(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """List all watchlists for the current user. Seeds a default one if none exist."""
    watchlists = await service.list_watchlists(db, user.id)
    if not watchlists:
        default = await service.ensure_default_watchlist(db, user.id)
        watchlists = [default]
    return WatchlistListOut(watchlists=watchlists)


@router.post("/", response_model=WatchlistOut, status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    body: WatchlistCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Create a new watchlist."""
    return await service.create_watchlist(db, user.id, body.name)


@router.get("/{watchlist_id}", response_model=WatchlistOut)
async def get_watchlist(
    watchlist_id: uuid.UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Get a single watchlist by ID."""
    wl = await service.get_watchlist(db, watchlist_id, user.id)
    if not wl:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    return wl


@router.patch("/{watchlist_id}", response_model=WatchlistOut)
async def rename_watchlist(
    watchlist_id: uuid.UUID,
    body: WatchlistRename,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Rename a watchlist."""
    wl = await service.rename_watchlist(db, watchlist_id, user.id, body.name)
    if not wl:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    return wl


@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist(
    watchlist_id: uuid.UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Delete a watchlist and all its coins."""
    deleted = await service.delete_watchlist(db, watchlist_id, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Watchlist not found")


@router.post("/{watchlist_id}/coins", response_model=WatchlistOut)
async def add_coin(
    watchlist_id: uuid.UUID,
    body: WatchlistAddCoin,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Add a coin to a watchlist. Returns the updated watchlist."""
    coin = await service.add_coin(db, watchlist_id, user.id, body.coin_id)
    if not coin:
        raise HTTPException(status_code=400, detail="Watchlist not found or coin already in watchlist")
    wl = await service.get_watchlist(db, watchlist_id, user.id)
    return wl


@router.delete("/{watchlist_id}/coins/{coin_id}", response_model=WatchlistOut)
async def remove_coin(
    watchlist_id: uuid.UUID,
    coin_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    """Remove a coin from a watchlist. Returns the updated watchlist."""
    removed = await service.remove_coin(db, watchlist_id, user.id, coin_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Watchlist or coin not found")
    wl = await service.get_watchlist(db, watchlist_id, user.id)
    return wl
