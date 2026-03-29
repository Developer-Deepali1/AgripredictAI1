"""
Translation utility.
Uses googletrans (free, no API key) with an in-memory cache.
Gracefully falls back to the original text when the library is unavailable
or the translation fails.

Logging is written to ``logs/translator.log`` via the centralized logger.
"""
from functools import lru_cache

from app.core.logger import translator_logger as logger

# Language-code mapping for googletrans
_LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "od": "or",   # ISO 639 code for Odia is "or"
}


def _get_translator():
    """Lazy-load the googletrans Translator."""
    try:
        from googletrans import Translator  # type: ignore
        return Translator()
    except Exception:
        return None


# Module-level singleton (created once)
_translator = None


def _translator_instance():
    global _translator
    if _translator is None:
        _translator = _get_translator()
    return _translator


@lru_cache(maxsize=512)
def translate_text(text: str, src: str, dest: str) -> str:
    """
    Translate *text* from language *src* to *dest*.

    Both *src* and *dest* use internal codes ("en", "hi", "od").
    Returns the original *text* on failure.
    """
    if src == dest or not text.strip():
        return text

    gt_src = _LANG_MAP.get(src, "en")
    gt_dest = _LANG_MAP.get(dest, "en")

    t = _translator_instance()
    if t is None:
        logger.debug("googletrans not available; returning original text (%s→%s)", src, dest)
        return text

    try:
        result = translator.translate(text, src=gt_src, dest=gt_dest)
        translated = result.text if result and result.text else text
        logger.debug(
            "Translated (%s→%s): '%s' → '%s'",
            src, dest, text[:60], translated[:60],
        )
        return translated
    except Exception as exc:
        logger.warning("Translation failed (%s→%s): %s | input='%s'", src, dest, exc, text[:60])
        logger.debug("Translating (%s→%s): '%s'", src, dest, text[:80])
        result = t.translate(text, src=gt_src, dest=gt_dest)
        translated = result.text if result and result.text else text
        logger.debug("Translation result (%s→%s): '%s'", src, dest, translated[:80])
        return translated
    except Exception as exc:
        logger.warning(
            "Translation failed (%s→%s) for text='%s': %s",
            src, dest, text[:80], exc,
        )
        return text
