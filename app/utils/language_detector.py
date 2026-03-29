"""
Language detection utility.
Tries langdetect first; falls back to simple heuristics.
"""
import re
import logging

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# Devanagari Unicode ranges used by Hindi (and partially Odia)
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
# Odia Unicode block
_ODIA_RE = re.compile(r"[\u0B00-\u0B7F]")


def _heuristic_detect(text: str) -> str:
    """Simple script-based language detection."""
    if _ODIA_RE.search(text):
        return "od"
    if _DEVANAGARI_RE.search(text):
        return "hi"
    return "en"


def detect_language(text: str) -> str:
    """
    Detect the language of *text*.

    Returns one of: "en", "hi", "od"
    Falls back to "en" on any error.
    """
    if not text or not text.strip():
        return "en"

    # 1) Script-based heuristic (fast, no dependency)
    lang = _heuristic_detect(text)
    if lang != "en":
        return lang

    # 2) Try langdetect (optional dependency)
    try:
        from langdetect import detect  # type: ignore
        detected = detect(text)
        if detected == "hi":
            return "hi"
        if detected in ("or", "od"):
            return "od"
        return "en"
    except Exception:
        pass  # library not installed or detection failed

    return "en"
