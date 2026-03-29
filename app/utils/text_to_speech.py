"""
Text-to-Speech utility.
Converts text to an MP3 audio file and returns the file path.

Priority order:
  1. gTTS (Google TTS, free, requires internet)
  2. pyttsx3 (offline, system TTS)
  3. Returns None on failure.
"""
import hashlib
import logging
import os
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)

# Directory where generated audio files are stored
_AUDIO_DIR = os.path.join(tempfile.gettempdir(), "agripredict_tts")
os.makedirs(_AUDIO_DIR, exist_ok=True)

# Map internal lang code → gTTS language tag
_GTTS_LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "od": "en",   # gTTS does not support Odia; fall back to English
}


def _audio_cache_path(text: str, language: str) -> str:
    """Return a deterministic file path for the given text+language combo."""
    key = hashlib.sha256(f"{language}:{text}".encode()).hexdigest()
    return os.path.join(_AUDIO_DIR, f"tts_{key}.mp3")


def synthesize_speech(text: str, language: str = "en") -> Optional[str]:
    """
    Convert *text* to speech and save as MP3.

    Args:
        text: The text to speak.
        language: Internal language code ("en", "hi", "od").

    Returns:
        Absolute path of the generated MP3 file, or None on failure.
    """
    if not text or not text.strip():
        return None

    cached = _audio_cache_path(text, language)
    if os.path.isfile(cached):
        return cached   # Cache hit

    # ------------------------------------------------------------------
    # Option 1: gTTS
    # ------------------------------------------------------------------
    try:
        from gtts import gTTS  # type: ignore
        lang_tag = _GTTS_LANG_MAP.get(language, "en")
        tts = gTTS(text=text, lang=lang_tag, slow=False)
        tts.save(cached)
        return cached
    except Exception as exc:
        logger.warning("gTTS synthesis failed: %s", exc)

    # ------------------------------------------------------------------
    # Option 2: pyttsx3 (offline)
    # ------------------------------------------------------------------
    try:
        import pyttsx3  # type: ignore
        engine = pyttsx3.init()
        engine.save_to_file(text, cached)
        engine.runAndWait()
        if os.path.isfile(cached):
            return cached
    except Exception as exc:
        logger.warning("pyttsx3 synthesis failed: %s", exc)

    return None
