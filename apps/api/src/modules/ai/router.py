"""
AI router — CoinDash AI

Exposes two endpoints:
    POST /api/v1/ai/chat          — standard JSON request/response
    POST /api/v1/ai/chat/stream   — Server-Sent Events (SSE) token streaming

Both follow the same patterns as other CoinDash routers:
    - APIRouter with prefix + tags
    - Pydantic request models
    - Thin controllers that delegate to service layer
    - Structured logging
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.logging import get_logger
from src.modules.ai import service
from src.modules.ai.schemas import ChatRequest, ChatResponse
from src.modules.auth.dependencies import OptionalCurrentUser
from src.db.session import get_db

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
async def chat(body: ChatRequest, current_user: OptionalCurrentUser, db: AsyncSession = Depends(get_db)) -> ChatResponse:
    """
    Non-streaming endpoint. Returns a complete JSON response.
    Kept for backward compatibility and simpler clients.
    """
    user_id = current_user.id if current_user else None
    reply = await service.chat(user_id, body.message, db)
    return ChatResponse(reply=reply)


@router.post(
    "/chat/stream",
    summary="Stream chat with CoinDash AI",
    description="Same as /chat, but returns Server-Sent Events (SSE) for "
                "real-time token-by-token streaming. Events: "
                "'token' (partial text), 'done' (stream complete), "
                "'error' (on failure).",
    responses={
        200: {
            "content": {"text/event-stream": {}},
            "description": "SSE stream of AI tokens",
        }
    },
)
async def chat_stream(body: ChatRequest, current_user: OptionalCurrentUser, db: AsyncSession = Depends(get_db)) -> StreamingResponse:
    """
    Streaming endpoint. Returns a text/event-stream response.

    The StreamingResponse wraps the async generator from service.chat_stream(),
    which yields pre-formatted SSE frames. FastAPI/Starlette will flush each
    chunk as it arrives, giving the frontend real-time token delivery.

    Headers:
        Cache-Control: no-cache       — prevents proxy/CDN buffering
        X-Accel-Buffering: no         — disables nginx buffering
        Connection: keep-alive        — keeps the stream open
    """
    user_id = current_user.id if current_user else None
    return StreamingResponse(
        service.chat_stream(user_id, body.message, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
