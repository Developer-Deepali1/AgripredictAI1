"""
Speech-to-Text utility.
Accepts an audio file path (WAV/MP3) and returns transcribed text.

Priority order:
  1. OpenAI Whisper (if API key configured)
  2. SpeechRecognition library (Google Web Speech API, free)
  3. Returns empty string + logs warning on failure.
"""
import logging
import os
from typing import Tuple

logger = logging.getLogger(__name__)


def _lang_code_to_bcp47(lang: str) -> str:
    """Convert internal language code to BCP-47 tag used by SpeechRecognition."""
    mapping = {
        "en": "en-IN",
        "hi": "hi-IN",
        "od": "or-IN",
    }
    return mapping.get(lang, "en-IN")


def transcribe_audio(audio_path: str, language: str = "en") -> Tuple[str, float]:
    """
    Transcribe an audio file to text.

    Args:
        audio_path: Path to the audio file (WAV preferred).
        language: Internal language code ("en", "hi", "od").

    Returns:
        Tuple of (transcribed_text, confidence_score 0.0-1.0).
        Returns ("", 0.0) on failure.
    """
    if not os.path.isfile(audio_path):
        logger.warning("Audio file not found: %s", audio_path)
        return "", 0.0

    # ------------------------------------------------------------------
    # Option 1: OpenAI Whisper (requires OPENAI_API_KEY env var)
    # ------------------------------------------------------------------
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if openai_key:
        try:
            import openai  # type: ignore
            client = openai.OpenAI(api_key=openai_key)
            with open(audio_path, "rb") as audio_file:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language if language != "od" else "en",
                )
            return response.text.strip(), 0.95
        except Exception as exc:
            logger.warning("Whisper transcription failed: %s", exc)

    # ------------------------------------------------------------------
    # Option 2: SpeechRecognition (free Google Web Speech API)
    # ------------------------------------------------------------------
    try:
        import speech_recognition as sr  # type: ignore
        recognizer = sr.Recognizer()
        bcp47 = _lang_code_to_bcp47(language)
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data, language=bcp47)
        return text.strip(), 0.80
    except Exception as exc:
        logger.warning("SpeechRecognition transcription failed: %s", exc)

    return "", 0.0
