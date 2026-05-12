from sqlalchemy import String, Float, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base, UUIDMixin, TimestampMixin


class Alert(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "alerts"
    
    user_id: Mapped[str] = mapped_column(String, index=True)
    coin_id: Mapped[str] = mapped_column(String(100), index=True)
    type: Mapped[str] = mapped_column(String(50))
    value: Mapped[float] = mapped_column(Float)
    is_triggered: Mapped[bool] = mapped_column(Boolean, default=False)

    __table_args__ = (
        Index("ix_alerts_user_coin", "user_id", "coin_id"),
    )
