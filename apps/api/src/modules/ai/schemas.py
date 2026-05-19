"""
AI module schemas — CoinDash AI

Pydantic request/response models for the /ai endpoints.
Strict typing guarantees contract stability between frontend and backend.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Requests ──────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    """Payload sent by the frontend CoinDashAI component."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's chat message",
        examples=["What is Bitcoin dominance?"],
    )


# ── Responses ─────────────────────────────────────────────────────────────────
class ChatResponse(BaseModel):
    """
    Exactly matches the contract expected by CoinDashAI.jsx:
        const data = await response.json();
        data.reply   → rendered in the chat bubble
    """

    reply: str = Field(
        ...,
        description="The AI assistant's response text",
    )
