# Re-export oauth2_scheme from core to maintain a single definition.
# Modules can import from here for backward compatibility.
from src.core.dependencies import oauth2_scheme  # noqa: F401
