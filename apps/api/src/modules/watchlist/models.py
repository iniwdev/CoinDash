import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from src.modules.auth.models import User


class Watchlist(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "watchlists"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_main: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="watchlists")
    coins: Mapped[list["WatchlistCoin"]] = relationship(
        "WatchlistCoin", 
        back_populates="watchlist", 
        cascade="all, delete-orphan", 
        lazy="selectin"
    )


class WatchlistCoin(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "watchlist_coins"
    
    watchlist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("watchlists.id", ondelete="CASCADE"), index=True, nullable=False
    )
    coin_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    
    # Relationships
    watchlist: Mapped["Watchlist"] = relationship("Watchlist", back_populates="coins")

    __table_args__ = (
        UniqueConstraint("watchlist_id", "coin_id", name="uq_watchlist_coin"),
    )
