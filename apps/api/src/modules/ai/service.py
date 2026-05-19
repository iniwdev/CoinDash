"""
AI service layer — CoinDash AI

Production-grade Groq integration with:
    - Official AsyncGroq SDK (fully async, no thread-pool hacks)
    - Singleton client with lazy initialisation
    - Environment-based configuration (model, temperature, tokens, timeout)
    - Structured logging at every decision point
    - Graceful fallback when GROQ_API_KEY is missing (dev-friendly)
    - Timeout handling via httpx's built-in deadline propagation
    - Response sanitisation to strip markdown artefacts
    - Greeting fast-path that bypasses the LLM entirely

Architecture:
    router.py  →  service.chat()  →  AIService.generate_response()  →  Groq API
                                          ↕
                                   _sanitize_reply()
"""

from __future__ import annotations

import re
import logging
from typing import Optional

from groq import AsyncGroq, APITimeoutError, APIConnectionError, APIStatusError

from src.core.config import settings
from src.core.exceptions import ExternalAPIError

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Prompt engineering
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT: str = """
You are CoinDash AI.

You respond exactly like a helpful chat assistant.

Rules:
- Speak naturally and conversationally
- Use plain text only
- Never use markdown
- Never use tables
- Never use headings
- Never use bullet points unless absolutely necessary
- Never use ###, **, |, or ---
- Never generate articles
- Answer fully and completely
- Do not cut answers off mid-thought
- If the answer is long, continue until finished
- Sound intelligent, modern, and human

Bad response example:
"### Overview | Name | Description |"

Good response example:
"Bitcoin is a decentralized digital currency that works without banks. It runs on blockchain technology and is often called digital gold because of its limited supply."

Always behave like a real AI chat assistant.
""".strip()


# ─────────────────────────────────────────────────────────────────────────────
# Greeting fast-path (skips LLM round-trip)
# ─────────────────────────────────────────────────────────────────────────────
_GREETING_RE = re.compile(r"^(hi|hello|hey)\b|who are you", re.IGNORECASE)

_GREETING_REPLY: str = (
    "Hey! I'm CoinDash AI. I can help with crypto research, portfolio "
    "insights, market trends, and trading-related questions."
)

_FALLBACK_REPLY: str = (
    "I'm having trouble connecting to my AI backend right now. "
    "Please try again in a moment."
)

_NO_KEY_REPLY: str = (
    "CoinDash AI is not configured yet. Please set the GROQ_API_KEY "
    "environment variable to enable AI chat."
)


# ─────────────────────────────────────────────────────────────────────────────
# Response sanitisation (ported from legacy Express aiRoutes.js)
# ─────────────────────────────────────────────────────────────────────────────
def _sanitize_reply(text: str) -> str:
    """Strip markdown artefacts that some models inject despite the prompt."""
    if not text:
        return ""
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"#{1,6}", "", text)
    text = re.sub(r"`", "", text)
    text = re.sub(r"\|", "", text)
    text = re.sub(r"---+", "", text)
    text = re.sub(r">", "", text)
    text = re.sub(r"<br\s*/?>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# AIService — singleton Groq client wrapper
# ─────────────────────────────────────────────────────────────────────────────
class AIService:
    """
    Manages a single AsyncGroq client for the lifetime of the process.

    Why a class instead of a bare function?
        - The AsyncGroq client manages an internal httpx connection pool.
          Re-creating it per request would leak connections and burn latency
          on TLS handshakes.
        - A singleton lets us initialise lazily (so import-time failures
          don't crash the entire app) and share the pool across requests.
    """

    _client: Optional[AsyncGroq] = None

    @classmethod
    def _get_client(cls) -> AsyncGroq:
        """Lazy singleton — created on first call, reused thereafter."""
        if cls._client is None:
            logger.info(
                "Initialising Groq client (model=%s, timeout=%ds)",
                settings.ai_model,
                settings.ai_timeout_seconds,
            )
            cls._client = AsyncGroq(
                api_key=settings.groq_api_key,
                timeout=settings.ai_timeout_seconds,
            )
        return cls._client

    @classmethod
    async def generate_response(cls, message: str) -> str:
        """
        Send a chat completion request to Groq and return the sanitised reply.

        Error hierarchy (from most to least specific):
            APITimeoutError   → deadline exceeded (Groq or network too slow)
            APIConnectionError → DNS / TLS / socket failure
            APIStatusError     → 4xx/5xx from Groq (rate-limit, bad model, etc.)
            Exception          → anything unexpected
        """
        client = cls._get_client()

        try:
            logger.debug(
                "Groq request: model=%s, temp=%.1f, max_tokens=%d",
                settings.ai_model,
                settings.ai_temperature,
                settings.ai_max_tokens,
            )

            completion = await client.chat.completions.create(
                model=settings.ai_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                ],
                temperature=settings.ai_temperature,
                max_tokens=settings.ai_max_tokens,
                top_p=1.0,
            )

            # Extract reply — guard against empty / malformed responses
            raw_reply = (
                completion.choices[0].message.content
                if completion.choices
                else ""
            )

            if not raw_reply:
                logger.warning("Groq returned empty content — completion=%s", completion)
                return _FALLBACK_REPLY

            logger.info("Groq reply received (%d chars raw)", len(raw_reply))
            return _sanitize_reply(raw_reply)

        except APITimeoutError:
            logger.error(
                "Groq request timed out after %ds", settings.ai_timeout_seconds
            )
            return _FALLBACK_REPLY

        except APIConnectionError as exc:
            logger.error("Groq connection failed: %s", exc)
            return _FALLBACK_REPLY

        except APIStatusError as exc:
            logger.error(
                "Groq API error: status=%d body=%s",
                exc.status_code,
                exc.body,
            )
            # Surface rate-limit info so the caller understands the failure
            if exc.status_code == 429:
                return (
                    "I'm receiving too many requests right now. "
                    "Please wait a moment and try again."
                )
            return _FALLBACK_REPLY

        except Exception as exc:
            logger.exception("Unexpected error during Groq call: %s", exc)
            return _FALLBACK_REPLY


# ─────────────────────────────────────────────────────────────────────────────
# Public API (called by router.py)
# ─────────────────────────────────────────────────────────────────────────────
async def chat(message: str) -> str:
    """
    Process a user message and return the AI reply.

    Decision tree:
        1. Greeting regex → instant canned reply (0 ms)
        2. No API key     → helpful config message
        3. Otherwise      → Groq LLM round-trip
    """
    logger.info("AI chat request received (%d chars)", len(message))

    # ── Fast-path: greetings bypass the LLM entirely ──────────────────────
    if _GREETING_RE.search(message.strip()):
        logger.debug("Greeting detected — returning canned reply")
        return _GREETING_REPLY

    # ── Guard: missing API key ────────────────────────────────────────────
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is empty — AI chat disabled")
        return _NO_KEY_REPLY

    # ── Groq LLM call ────────────────────────────────────────────────────
    return await AIService.generate_response(message)
