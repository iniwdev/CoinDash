"""
Pagination utilities.

Usage:
    from src.utils.pagination import paginate_query, PaginationParams

    @router.get("/items")
    async def list_items(
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
    ):
        return await paginate_query(db, select(Item), page, per_page)
"""

from math import ceil
from typing import Any, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

T = TypeVar("T")


async def paginate_query(
    db: AsyncSession,
    stmt: Select,
    page: int = 1,
    per_page: int = 20,
) -> dict[str, Any]:
    """
    Execute a SELECT statement with LIMIT/OFFSET and return a pagination envelope.

    Returns:
        {
            "items": [...],
            "meta": {"page": 1, "per_page": 20, "total": 100, "total_pages": 5}
        }
    """
    # Count total rows (runs a subquery)
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = (await db.execute(count_stmt)).scalar_one()

    # Fetch page
    offset = (page - 1) * per_page
    result = await db.execute(stmt.offset(offset).limit(per_page))
    items = result.scalars().all()

    return {
        "items": items,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": ceil(total / per_page) if total > 0 else 0,
        },
    }
