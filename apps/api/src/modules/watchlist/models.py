from sqlalchemy import String, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base, UUIDMixin, TimestampMixin


class Watchlist(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "watchlists"
    
    user_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String(100))
    is_main: Mapped[bool] = mapped_column(Boolean, default=False)
    
    coins: Mapped[list["WatchlistCoin"]] = relationship(
        "WatchlistCoin", 
        back_populates="watchlist", 
        cascade="all, delete-orphan", 
        lazy="selectin"
    )


class WatchlistCoin(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "watchlist_coins"
    
    watchlist_id: Mapped[str] = mapped_column(ForeignKey("watchlists.id", ondelete="CASCADE"), index=True)
    coin_id: Mapped[str] = mapped_column(String(100), index=True)
    
    watchlist: Mapped["Watchlist"] = relationship("Watchlist", back_populates="coins")

    __table_args__ = (
        UniqueConstraint("watchlist_id", "coin_id", name="uq_watchlist_coin"),
    )
