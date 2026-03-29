"""
Voice Chat API endpoints:
  POST /api/chat/voice  – upload audio, get transcription + AI response
"""
import logging
import os
import tempfile
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.chatbot_schema import VoiceChatResponse, ComparisonEntry, StructuredCropData
from app.services import chatbot_service, conversation_memory
from app.utils import speech_to_text

logger = logging.getLogger(__name__)
router = APIRouter()

_SUPPORTED_AUDIO_TYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/mpeg", "audio/mp3",
    "audio/ogg", "audio/webm",
    "application/octet-stream",  # some browsers send this
}


@router.post("/voice", response_model=VoiceChatResponse, summary="Voice chat (audio upload)")
async def voice_chat(
    audio_file: UploadFile = File(..., description="WAV / MP3 audio file with farmer's query"),
    language: str = Form(default="en", description="Language code: en | hi | od"),
    session_id: str = Form(default="", description="Session identifier"),
) -> VoiceChatResponse:
    """
    Accept an audio file, transcribe it, then pass the text through
    the chatbot service and return the AI response.
    """
    # Validate content type (lenient – some clients omit it)
    if audio_file.content_type and audio_file.content_type not in _SUPPORTED_AUDIO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio format: {audio_file.content_type}",
        )

    if not session_id:
        session_id = str(uuid.uuid4())

    # Save uploaded file to a temp location
    suffix = os.path.splitext(audio_file.filename or "audio.wav")[-1] or ".wav"
    tmp_path: str = ""
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp_path = tmp.name
            content = await audio_file.read()
            tmp.write(content)

        # Transcribe
        transcribed_text, confidence = speech_to_text.transcribe_audio(tmp_path, language)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not transcribed_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not transcribe the audio. Please try again with clearer audio.",
        )

    # Process through chatbot
    try:
        raw = chatbot_service.process_message(
            message=transcribed_text,
            language=language,
            session_id=session_id,
        )
    except Exception as exc:
        logger.exception("Voice chatbot error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing your voice query. Please try again.",
        )

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

    return VoiceChatResponse(
        reply_text=raw.get("reply_text", ""),
        reply_audio_url=raw.get("reply_audio_url"),
        structured_data=structured_data,
        comparison=comparison,
        suggestions=raw.get("suggestions", []),
        detected_language=raw.get("detected_language", "en"),
        session_id=session_id,
        transcribed_text=transcribed_text,
        transcription_confidence=confidence,
    )
