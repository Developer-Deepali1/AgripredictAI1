"""
Test endpoints for verifying chatbot connectivity.

Routes (prefix: /api/chat):
  POST /api/chat/test – echo test to confirm the chat endpoint is reachable
"""
import uuid
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.logger import api_logger as logger

router = APIRouter()


class TestChatRequest(BaseModel):
    message: Optional[str] = "ping"


@router.post("/test", summary="Chat connectivity test")
def test_chat(payload: TestChatRequest) -> dict:
    """
    Echo the incoming message back to the caller.

    Use this endpoint to verify that the backend is running and reachable
    from the frontend before sending real chat messages.
    """
    request_id = str(uuid.uuid4())
    logger.info("Chat test request | request_id=%s msg='%.100s'", request_id, payload.message)
    return {
        "status": "ok",
        "echo": payload.message,
        "request_id": request_id,
        "message": "Backend is reachable. Use POST /api/chat/ for real messages.",
    }
