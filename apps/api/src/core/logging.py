"""
Structured logging configuration for CoinDash API.

Usage:
    from src.core.logging import setup_logging, get_logger

    # Call once at startup (already done in main.py via setup_logging())
    logger = get_logger(__name__)
"""

import logging
import sys

from src.core.config import settings

_CONFIGURED = False


def setup_logging() -> None:
    """
    Configure root logger. Idempotent — safe to call multiple times.

    Development:  DEBUG level, human-readable format, stderr
    Production:   INFO level, JSON-ready format (structured fields, no colour)
    """
    global _CONFIGURED
    if _CONFIGURED:
        return

    log_level = logging.DEBUG if settings.debug else logging.INFO

    if settings.is_production:
        fmt = "%(asctime)s %(levelname)s %(name)s %(message)s"
    else:
        fmt = "%(asctime)s | %(levelname)-8s | %(name)s — %(message)s"

    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%dT%H:%M:%S"))

    # Silence noisy third-party loggers in production
    for noisy in ("uvicorn.access", "sqlalchemy.engine", "httpx"):
        lvl = logging.WARNING if settings.is_production else logging.DEBUG
        logging.getLogger(noisy).setLevel(lvl)

    logging.basicConfig(level=log_level, handlers=[handler], force=True)

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """Convenience wrapper — returns a named logger."""
    return logging.getLogger(name)
