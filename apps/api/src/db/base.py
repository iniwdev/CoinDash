"""
SQLAlchemy declarative base with a production-ready TimestampMixin.

All ORM models should inherit from Base.
Models that need audit timestamps should also inherit from TimestampMixin.

Example:
    class User(TimestampMixin, Base):
        __tablename__ = "users"
        ...
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


class TimestampMixin:
    """
    Adds server-side created_at / updated_at columns to any model.

    - created_at: set by the DB on INSERT, never changes
    - updated_at: set by the DB on INSERT, automatically updated on UPDATE
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """Adds a UUID primary key column (PostgreSQL UUID type)."""

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
