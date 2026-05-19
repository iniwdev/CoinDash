"""
AI service layer — CoinDash AI

Encapsulates all AI-provider logic behind a clean async interface.
The router never touches HTTP clients or prompt engineering directly.

Architecture:
    router.py  →  service.py  →  Groq / fallback
                                  ↕
                               Redis cache (future)

Current implementation returns a stub reply so the full vertical slice
(frontend → Vite proxy → FastAPI → response) can be validated end-to-end
before we wire in the real Groq SDK.
"""

from __future__ import annotations

import re
import logging

from src.core.config import settings
from src.core.exceptions import ExternalAPIError

logger = logging.getLogger(__name__)

# ── Prompt engineering ────────────────────────────────────────────────────────
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

# Quick-reply patterns that skip the LLM round-trip entirely
_GREETING_RE = re.compile(r"^(hi|hello|hey)\b|who are you", re.IGNORECASE)

_GREETING_REPLY: str = (
    "Hey! I'm CoinDash AI. I can help with crypto research, portfolio "
    "insights, market trends, and trading-related questions."
)


# ── Response sanitisation (ported from legacy Express) ────────────────────────
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


# ── Public API ────────────────────────────────────────────────────────────────
async def chat(message: str) -> str:
    """
    Process a user message and return the AI reply.

    Phase 1 (current):  Returns a stub response for vertical-slice validation.
    Phase 2 (next):     Groq SDK integration with async httpx.
    """
    logger.info("AI chat request received (%d chars)", len(message))

    # Fast-path: greetings bypass the LLM entirely
    if _GREETING_RE.search(message.strip()):
        logger.debug("Greeting detected — returning canned reply")
        return _GREETING_REPLY

    # ── Stub response (Phase 1) ───────────────────────────────────────────
    # This proves the full pipeline works before we add Groq credentials.
    # Replace this block with the Groq call in Phase 2.
    logger.info("Returning stub reply (Groq integration pending)")
    return "AI module connected successfully. Groq integration coming next."
