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

from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse

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
    Non-streaming endpoint. Returns a complete JSON response.
    Kept for backward compatibility and simpler clients.
    """
    reply = await service.chat(body.message)
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
async def chat_stream(body: ChatRequest) -> StreamingResponse:
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
    return StreamingResponse(
        service.chat_stream(body.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
