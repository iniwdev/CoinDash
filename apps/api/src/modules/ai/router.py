"""
AI router — CoinDash AI

Exposes POST /api/v1/ai/chat for the CoinDash AI assistant.
Follows the same patterns as auth/coins/watchlist/alerts routers:
    - APIRouter with prefix + tags
    - Pydantic request/response models
    - Thin controller that delegates to service layer
    - Structured logging
"""

from __future__ import annotations

from fastapi import APIRouter, status

from src.core.logging import get_logger
from src.modules.ai import service
from src.modules.ai.schemas import ChatRequest, ChatResponse

logger = get_logger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with CoinDash AI",
    description="Send a message to the CoinDash AI assistant and receive "
                "a conversational reply about crypto markets, portfolio "
                "insights, and trading strategies.",
)
async def chat(body: ChatRequest) -> ChatResponse:
    """
    Thin controller — all business logic lives in service.py.
    """
    reply = await service.chat(body.message)
    return ChatResponse(reply=reply)
