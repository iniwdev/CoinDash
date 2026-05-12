"""
Shared Pydantic response schemas used across multiple modules.

Module-specific schemas (request/response for a single module) live inside
the module itself (e.g. src/modules/auth/schemas.py). Only truly cross-cutting
schemas belong here.
"""

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Generic single-message response."""
    message: str


class PaginatedMeta(BaseModel):
    """Pagination metadata embedded in list responses."""
    page: int
    per_page: int
    total: int
    total_pages: int


class HealthCheck(BaseModel):
    """Standard health/liveness probe response shape."""
    status: str
    version: str
    env: str
    checks: dict[str, str] = {}
