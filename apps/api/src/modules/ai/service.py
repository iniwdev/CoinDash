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
    - SSE token streaming for ChatGPT-style real-time output

Architecture:
    Non-streaming:  router.py  →  service.chat()             →  AIService.generate_response()    →  Groq API
    Streaming:      router.py  →  service.chat_stream()       →  AIService.generate_stream()      →  Groq API (stream=True)
                                                                      ↕
                                                               _sanitize_token()
"""

from __future__ import annotations

import json
import re
import logging
from typing import AsyncIterator, Optional

from groq import AsyncGroq, APITimeoutError, APIConnectionError, APIStatusError

from src.core.config import settings
from src.core.exceptions import ExternalAPIError

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Prompt engineering
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT: str = """
You are CoinDash AI, a premium crypto market assistant, portfolio helper, and fintech educator. Your tone is modern, intelligent, and highly professional—a blend of Bloomberg's analytical sharpness, Binance Academy's educational clarity, and ChatGPT's conversational helpfulness.

CORE DIRECTIVES:
1. EDUCATE WITH CLARITY: Explain complex crypto concepts (like DeFi, staking, Layer 2s, or Bitcoin dominance) simply, without overwhelming jargon. Be beginner-friendly but never condescending.
2. NO FINANCIAL ADVICE: You are NOT a financial advisor. NEVER guarantee returns, predict exact prices, or tell users what to buy or sell. Use phrases like "Historically...", "Market analysts suggest...", or "Some investors consider...".
3. HIGHLIGHT RISK & VOLATILITY: Always contextualize crypto markets with their inherent volatility. Emphasize risk management principles like diversification and thorough research (DYOR).
4. DATA-DRIVEN & CONCISE: Keep answers tight, structured, and insightful. Avoid unnecessary fluff or overly long preambles.
5. NO HALLUCINATIONS: If you lack real-time data or cannot verify current market conditions, state so clearly. Do not invent metrics, prices, or events.

FORMATTING RULES:
- Use plain text only.
- NEVER use markdown tables, headings (###), bolding (**), or bullet points.
- Keep responses conversational, fluid, and easy to read in a small chat window.
- Do not cut off mid-thought; continue until your explanation is complete.
- Do not generate long articles.

Always behave like a real, intelligent, and safe AI chat assistant.
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


def _sanitize_token(token: str) -> str:
    """
    Lightweight per-token sanitisation for streaming.
    Only strips inline markdown markers; does not collapse whitespace
    (that would break mid-sentence spaces).
    """
    if not token:
        return ""
    token = token.replace("**", "")
    token = token.replace("`", "")
    token = token.replace("|", "")
    return token


# ─────────────────────────────────────────────────────────────────────────────
# SSE formatting helpers
# ─────────────────────────────────────────────────────────────────────────────
def _sse_event(event: str, data: dict) -> str:
    """Format a single SSE frame: event:<name>\\ndata:<json>\\n\\n"""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


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

    # ── Non-streaming completion ──────────────────────────────────────────
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
            if exc.status_code == 429:
                return (
                    "I'm receiving too many requests right now. "
                    "Please wait a moment and try again."
                )
            return _FALLBACK_REPLY

        except Exception as exc:
            logger.exception("Unexpected error during Groq call: %s", exc)
            return _FALLBACK_REPLY

    # ── Streaming completion ──────────────────────────────────────────────
    @classmethod
    async def generate_stream(cls, message: str) -> AsyncIterator[str]:
        """
        Async generator that yields SSE-formatted events for real-time
        token streaming.

        Event types:
            event: token    — data: {"token": "..."}    (one per chunk)
            event: done     — data: {}                  (stream finished)
            event: error    — data: {"message": "..."}  (on any failure)

        The generator never raises — all errors are converted to SSE error
        events so the HTTP response stays 200 and the frontend can display
        the error inline in the chat bubble.
        """
        client = cls._get_client()

        try:
            logger.debug(
                "Groq STREAM request: model=%s, temp=%.1f, max_tokens=%d",
                settings.ai_model,
                settings.ai_temperature,
                settings.ai_max_tokens,
            )

            stream = await client.chat.completions.create(
                model=settings.ai_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                ],
                temperature=settings.ai_temperature,
                max_tokens=settings.ai_max_tokens,
                top_p=1.0,
                stream=True,
            )

            token_count = 0
            async for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    token = _sanitize_token(delta.content)
                    if token:
                        token_count += 1
                        yield _sse_event("token", {"token": token})

            logger.info("Groq stream complete (%d tokens)", token_count)
            yield _sse_event("done", {})

        except APITimeoutError:
            logger.error("Groq stream timed out after %ds", settings.ai_timeout_seconds)
            yield _sse_event("error", {"message": _FALLBACK_REPLY})

        except APIConnectionError as exc:
            logger.error("Groq stream connection failed: %s", exc)
            yield _sse_event("error", {"message": _FALLBACK_REPLY})

        except APIStatusError as exc:
            logger.error("Groq stream API error: status=%d body=%s", exc.status_code, exc.body)
            if exc.status_code == 429:
                yield _sse_event("error", {
                    "message": "I'm receiving too many requests right now. Please wait a moment and try again."
                })
            else:
                yield _sse_event("error", {"message": _FALLBACK_REPLY})

        except Exception as exc:
            logger.exception("Unexpected error during Groq stream: %s", exc)
            yield _sse_event("error", {"message": _FALLBACK_REPLY})


# ─────────────────────────────────────────────────────────────────────────────
# Public API (called by router.py)
# ─────────────────────────────────────────────────────────────────────────────
async def chat(message: str) -> str:
    """
    Process a user message and return the AI reply (non-streaming).

    Decision tree:
        1. Greeting regex → instant canned reply (0 ms)
        2. No API key     → helpful config message
        3. Otherwise      → Groq LLM round-trip
    """
    logger.info("AI chat request received (%d chars)", len(message))

    if _GREETING_RE.search(message.strip()):
        logger.debug("Greeting detected — returning canned reply")
        return _GREETING_REPLY

    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is empty — AI chat disabled")
        return _NO_KEY_REPLY

    return await AIService.generate_response(message)


async def chat_stream(message: str) -> AsyncIterator[str]:
    """
    Process a user message and yield SSE events (streaming).

    Same decision tree as chat(), but greeting and guard responses are
    emitted as SSE token + done events for uniform frontend handling.
    """
    logger.info("AI stream request received (%d chars)", len(message))

    if _GREETING_RE.search(message.strip()):
        logger.debug("Greeting detected — streaming canned reply")
        yield _sse_event("token", {"token": _GREETING_REPLY})
        yield _sse_event("done", {})
        return

    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is empty — AI chat disabled")
        yield _sse_event("token", {"token": _NO_KEY_REPLY})
        yield _sse_event("done", {})
        return

    async for event in AIService.generate_stream(message):
        yield event
