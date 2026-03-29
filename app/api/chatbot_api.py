"""
Chatbot API endpoints:
  POST   /api/chat            – text chat
  GET    /api/chat/history/{session_id} – conversation history
  DELETE /api/chat/history/{session_id} – clear history
  GET    /api/chat/audio/{filename}     – serve TTS audio files
"""
import os
import tempfile
import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.core.logger import api_logger as logger
from app.schemas.chatbot_schema import (
    ChatRequest,
    ChatResponse,
    ComparisonEntry,
    ConversationHistoryResponse,
    ConversationTurn,
    StructuredCropData,
)
from app.services import chatbot_service, conversation_memory
from app.utils.error_handler import ChatbotException
router = APIRouter()

# Directory where TTS audio files are stored (must match text_to_speech.py)
_AUDIO_DIR = os.path.join(tempfile.gettempdir(), "agripredict_tts")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_response(raw: dict, session_id: str) -> ChatResponse:
    """Convert the raw service dict to a ChatResponse schema."""
    sd_raw = raw.get("structured_data") or {}
    structured_data = StructuredCropData(**{
        k: v for k, v in sd_raw.items()
        if k in StructuredCropData.model_fields
    }) if sd_raw else None

    comp_raw = raw.get("comparison") or []
    comparison = [
        ComparisonEntry(**{k: v for k, v in c.items() if k in ComparisonEntry.model_fields})
        for c in comp_raw
    ] if comp_raw else None

    return ChatResponse(
        reply_text=raw.get("reply_text", ""),
        reply_audio_url=raw.get("reply_audio_url"),
        structured_data=structured_data,
        comparison=comparison,
        suggestions=raw.get("suggestions", []),
        detected_language=raw.get("detected_language", "en"),
        session_id=session_id,
        request_id=raw.get("request_id"),
        error=raw.get("error"),
        error_code=raw.get("error_code"),
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=ChatResponse, summary="Send a chat message")
def chat(payload: ChatRequest) -> ChatResponse:
    """
    Process a text message from a farmer and return an AI-generated response.

    On unexpected errors the response includes an ``error_code`` and
    ``request_id`` so callers can correlate failures with server logs.
    """
    session_id = payload.session_id or str(uuid.uuid4())

    logger.info(
        "Chat request | session=%s lang=%s msg_len=%d",
        session_id, payload.language, len(payload.message),
    )

    try:
        raw = chatbot_service.process_message(
            message=payload.message,
            language=payload.language,
            session_id=session_id,
        )
    except ChatbotException as exc:
        logger.error(
            "ChatbotException [%s] %s: %s | details=%s",
            exc.request_id, exc.error_code.value, exc.message, exc.details,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": exc.message,
                "error_code": exc.error_code.value,
                "details": exc.details,
                "request_id": exc.request_id or session_id,
            },
        )
    except Exception as exc:
        logger.exception("Unexpected chatbot processing error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "I encountered an error processing your request. Please try again.",
                "error_code": "UNK_001",
            },
        )

    if raw.get("error_code"):
        logger.warning(
            "Chat request completed with error | session=%s error_code=%s request_id=%s",
            session_id, raw.get("error_code"), raw.get("request_id"),
        )
    else:
        logger.info(
            "Chat request completed | session=%s request_id=%s",
            session_id, raw.get("request_id"),
        )

    return _build_response(raw, session_id)


@router.get("/history/{session_id}", response_model=ConversationHistoryResponse)
def get_history(session_id: str) -> ConversationHistoryResponse:
    """Return the conversation history for a given session."""
    turns_raw = conversation_memory.get_history(session_id)
    turns = [ConversationTurn(**t) for t in turns_raw]
    return ConversationHistoryResponse(
        session_id=session_id,
        turns=turns,
        total_turns=len(turns),
    )


@router.delete(
    "/history/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear conversation history",
)
def clear_history(session_id: str) -> None:
    """Delete all conversation history for a session."""
    conversation_memory.clear_history(session_id)


@router.get("/audio/{filename}", summary="Serve a TTS audio file")
def serve_audio(filename: str) -> FileResponse:
    """Stream a previously generated TTS audio file."""
    # Sanitise filename to prevent path traversal (including symlink attacks)
    safe_name = os.path.basename(filename)
    if not safe_name or ".." in safe_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename")

    audio_path = os.path.join(_AUDIO_DIR, safe_name)
    # Use realpath to resolve symlinks and verify the file is within the audio directory
    resolved = os.path.realpath(audio_path)
    if not resolved.startswith(os.path.realpath(_AUDIO_DIR) + os.sep):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename")
    if not os.path.isfile(resolved):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio file not found")

    return FileResponse(resolved, media_type="audio/mpeg", filename=safe_name)
