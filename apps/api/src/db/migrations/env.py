import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Import all models here so Alembic can detect them
from src.db.base import Base
from src.modules.auth.models import User, RefreshToken  # noqa: F401
from src.modules.watchlist.models import Watchlist, WatchlistCoin  # noqa: F401
from src.modules.alerts.models import Alert  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        render_as_batch=True  # Required for SQLite ALTER operations
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    from src.core.config import settings
    engine = create_async_engine(settings.database_url)
    async with engine.begin() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
