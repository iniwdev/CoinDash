import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from src.modules.auth.models import User


class Alert(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alerts"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    coin_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    is_triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="alerts")

    __table_args__ = (
        Index("ix_alerts_user_coin", "user_id", "coin_id"),
    )
