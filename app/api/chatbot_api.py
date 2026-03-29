"""
Chatbot API endpoints:
  POST   /api/chat            – text chat
  GET    /api/chat/history/{session_id} – conversation history
  DELETE /api/chat/history/{session_id} – clear history
  GET    /api/chat/audio/{filename}     – serve TTS audio files
"""
import logging
import os
import tempfile
import uuid
from typing import List

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.schemas.chatbot_schema import (
    ChatRequest,
    ChatResponse,
    ComparisonEntry,
    ConversationHistoryResponse,
    ConversationTurn,
    StructuredCropData,
)
from app.services import chatbot_service, conversation_memory

logger = logging.getLogger(__name__)
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
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=ChatResponse, summary="Send a chat message")
def chat(payload: ChatRequest) -> ChatResponse:
    """
    Process a text message from a farmer and return an AI-generated response.
    """
    # Generate a session_id if not provided (shouldn't happen due to schema validation)
    session_id = payload.session_id or str(uuid.uuid4())

    try:
        raw = chatbot_service.process_message(
            message=payload.message,
            language=payload.language,
            session_id=session_id,
        )
    except Exception as exc:
        logger.exception("Chatbot processing error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="I encountered an error processing your request. Please try again.",
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
