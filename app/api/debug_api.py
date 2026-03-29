"""
Debug API endpoints for AgriPredictAI.

Provides endpoints to test individual pipeline components and retrieve logs.
These endpoints are intended for development and troubleshooting only.

Routes (prefix: /api/debug):
  POST /test-language-detection  – Test language detection
  POST /test-translation         – Test translation
  POST /test-intent-extraction   – Test intent extraction
  GET  /logs/{module}            – Retrieve recent log lines
  GET  /request-trace/{request_id} – Find all log entries for a request
  GET  /health                   – Component health check
"""
import os
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from app.core.logger import LOG_DIR, api_logger

router = APIRouter(prefix="/api/debug", tags=["Debug"])


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class LanguageDetectionRequest(BaseModel):
    message: str


class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


class IntentExtractionRequest(BaseModel):
    text: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/test-language-detection", summary="Test language detection")
def test_language_detection(payload: LanguageDetectionRequest) -> Dict[str, Any]:
    """Detect the language of the given message."""
    try:
        from app.utils.language_detector import detect_language

        result = detect_language(payload.message)
        api_logger.info("Language detection test: '%s' → %s", payload.message[:50], result)
        return {
            "message": payload.message,
            "detected_language": result,
            "status": "success",
        }
    except Exception as exc:
Debug API – lightweight endpoints for testing individual pipeline components.

Mount with prefix ``/api/debug`` (added in ``app/main.py``).

All endpoints are intentionally **not** protected by auth so that
developers / CI pipelines can exercise them without credentials.
Remove or restrict these in a hardened production deployment.
"""
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.core.logger import api_logger

router = APIRouter(prefix="/api/debug", tags=["Debug"])

_LOG_DIR = Path("logs")


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

@router.get("/test-language-detection", summary="Test language detection")
def test_language_detection(
    message: str = Query(..., description="Text whose language should be detected"),
) -> dict:
    """Detect the language of *message* and return the result."""
    try:
        from app.utils.language_detector import detect_language

        detected = detect_language(message)
        api_logger.info("Language detection test: '%s' → %s", message[:60], detected)
        return {"message": message, "detected_language": detected, "status": "success"}
    except Exception as exc:  # pragma: no cover
        api_logger.error("Language detection test failed: %s", exc, exc_info=True)
        return {"error": str(exc), "status": "failed"}


@router.post("/test-translation", summary="Test translation")
def test_translation(payload: TranslationRequest) -> Dict[str, Any]:
# ---------------------------------------------------------------------------
# Translation
# ---------------------------------------------------------------------------

@router.get("/test-translation", summary="Test translation")
def test_translation(
    text: str = Query(..., description="Text to translate"),
    source_lang: str = Query("en", description="Source language code (en/hi/od)"),
    target_lang: str = Query("hi", description="Target language code (en/hi/od)"),
) -> dict:
    """Translate *text* from *source_lang* to *target_lang*."""
    try:
        from app.utils.translator import translate_text

        result = translate_text(payload.text, src=payload.source_lang, dest=payload.target_lang)
        api_logger.info(
            "Translation test: %s→%s '%s' → '%s'",
            payload.source_lang,
            payload.target_lang,
            payload.text[:50],
            result[:50],
        )
        return {
            "input": payload.text,
            "output": result,
            "source": payload.source_lang,
            "target": payload.target_lang,
            "status": "success",
        }
    except Exception as exc:
        result = translate_text(text, src=source_lang, dest=target_lang)
        api_logger.info(
            "Translation test: '%s' (%s→%s) → '%s'",
            text[:60], source_lang, target_lang, result[:60],
        )
        return {
            "input": text,
            "output": result,
            "source": source_lang,
            "target": target_lang,
            "status": "success",
        }
    except Exception as exc:  # pragma: no cover
        api_logger.error("Translation test failed: %s", exc, exc_info=True)
        return {"error": str(exc), "status": "failed"}


@router.post("/test-intent-extraction", summary="Test intent extraction")
def test_intent_extraction(payload: IntentExtractionRequest) -> Dict[str, Any]:
    """Extract intent from *text* (must be English)."""
    try:
        from app.engines.intent_engine import parse_intent

        result = parse_intent(payload.text)
        api_logger.info("Intent extraction test: '%s' → %s", payload.text[:50], result)
        return {"input": payload.text, "intent": result, "status": "success"}
    except Exception as exc:
# ---------------------------------------------------------------------------
# Intent extraction
# ---------------------------------------------------------------------------

@router.get("/test-intent-extraction", summary="Test intent extraction")
def test_intent_extraction(
    text: str = Query(..., description="English text to parse for intent"),
) -> dict:
    """Run the intent engine on *text* and return the parsed intent dict."""
    try:
        from app.engines.intent_engine import parse_intent

        intent = parse_intent(text)
        api_logger.info("Intent extraction test: '%s' → %s", text[:60], intent)
        return {"input": text, "intent": intent, "status": "success"}
    except Exception as exc:  # pragma: no cover
        api_logger.error("Intent extraction test failed: %s", exc, exc_info=True)
        return {"error": str(exc), "status": "failed"}


@router.get("/logs/{module}", summary="Retrieve recent log lines")
def get_logs(
    module: str,
    lines: int = Query(default=50, ge=1, le=500),
) -> Dict[str, Any]:
    """
    Return the last *lines* lines from ``logs/<module>.log``.

    Allowed module names are the base file names without extension
    (e.g. ``chatbot``, ``translator``, ``intent_engine``).
    """
    # Validate module name (alphanumeric + underscores only)
    if not module.replace("_", "").isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid module name. Use only letters, digits, and underscores.",
        )

    log_file = LOG_DIR / f"{module}.log"
    if not log_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log file not found for module: {module}",
        )

    try:
        with open(log_file, encoding="utf-8") as fh:
            all_lines = fh.readlines()
        return {
            "module": module,
            "total_lines": len(all_lines),
            "returned_lines": min(lines, len(all_lines)),
            "logs": all_lines[-lines:],
        }
    except Exception as exc:
        api_logger.error("Failed to read log file for %s: %s", module, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read log file: {exc}",
        )


@router.get("/request-trace/{request_id}", summary="Trace a specific request across all logs")
def get_request_trace(request_id: str) -> Dict[str, Any]:
    """
    Search all log files for lines containing *request_id* and return them
    in the order they were written (sorted by log file modification time).
    """
    # Validate request_id (alphanumeric + hyphens, max 36 chars for UUID)
    if not request_id.replace("-", "").isalnum() or len(request_id) > 36:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request_id format.",
        )

    matches: list = []
    try:
        for log_file in sorted(LOG_DIR.glob("*.log"), key=lambda f: f.stat().st_mtime):
            try:
                with open(log_file, encoding="utf-8") as fh:
                    for line in fh:
                        if request_id in line:
                            matches.append(
                                {"source": log_file.stem, "line": line.rstrip("\n")}
                            )
            except Exception:
                pass  # Skip unreadable files
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not search logs: {exc}",
        )

    return {
        "request_id": request_id,
        "total_entries": len(matches),
        "trace": matches,
    }


@router.get("/health", summary="Component health check")
def debug_health() -> Dict[str, Any]:
    """
    Check availability of optional dependencies used by the chatbot pipeline.
    """
    components: Dict[str, Any] = {}

    # googletrans
    try:
        from googletrans import Translator  # type: ignore  # noqa: F401
        components["googletrans"] = "available"
    except ImportError:
        components["googletrans"] = "unavailable"

    # gTTS
    try:
        from gtts import gTTS  # type: ignore  # noqa: F401
        components["gtts"] = "available"
    except ImportError:
        components["gtts"] = "unavailable"

    # SpeechRecognition
    try:
        import speech_recognition  # type: ignore  # noqa: F401
        components["speech_recognition"] = "available"
    except ImportError:
        components["speech_recognition"] = "unavailable"

    # langdetect
    try:
        from langdetect import detect  # type: ignore  # noqa: F401
        components["langdetect"] = "available"
    except ImportError:
        components["langdetect"] = "unavailable"

    # openai
    try:
        import openai  # type: ignore  # noqa: F401
        components["openai"] = "available"
    except ImportError:
        components["openai"] = "unavailable"

    # Logs directory
    components["logs_dir"] = str(LOG_DIR)
    components["log_files"] = [f.name for f in LOG_DIR.glob("*.log")]

    return {"status": "ok", "components": components}
# ---------------------------------------------------------------------------
# Full chat pipeline (end-to-end smoke test)
# ---------------------------------------------------------------------------

@router.get("/test-pipeline", summary="Test the full chatbot pipeline")
def test_pipeline(
    message: str = Query(..., description="Farmer query (any supported language)"),
    language: str = Query("en", description="Language code (en/hi/od)"),
    session_id: str = Query("debug-session", description="Session identifier"),
) -> dict:
    """
    Run the complete chatbot pipeline and return the response together with
    any intermediate error information.
    """
    try:
        from app.services.chatbot_service import process_message

        result = process_message(message=message, language=language, session_id=session_id)
        api_logger.info(
            "Pipeline test succeeded for session %s | lang=%s | msg='%s'",
            session_id, language, message[:60],
        )
        return {"result": result, "status": "success"}
    except Exception as exc:  # pragma: no cover
        api_logger.error("Pipeline test failed: %s", exc, exc_info=True)
        return {"error": str(exc), "status": "failed"}


# ---------------------------------------------------------------------------
# Log viewer
# ---------------------------------------------------------------------------

@router.get("/logs/{module}", summary="Retrieve recent log lines for a module")
def get_logs(
    module: str,
    lines: int = Query(50, ge=1, le=500, description="Number of tail lines to return"),
) -> dict:
    """
    Return the last *lines* lines from ``logs/<module>.log``.

    Allowed module names: ``chatbot``, ``translator``, ``intent_engine``, ``api``.
    """
    allowed = {"chatbot", "translator", "intent_engine", "api"}
    if module not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown module '{module}'. Allowed: {sorted(allowed)}",
        )

    log_file = _LOG_DIR / f"{module}.log"
    if not log_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log file for '{module}' not found (no log entries yet).",
        )

    with open(log_file, "r", encoding="utf-8", errors="replace") as fh:
        all_lines = fh.readlines()

    return {
        "module": module,
        "total_lines": len(all_lines),
        "returned_lines": min(lines, len(all_lines)),
        "logs": all_lines[-lines:],
    }


# ---------------------------------------------------------------------------
# Request trace
# ---------------------------------------------------------------------------

@router.get("/request-trace/{request_id}", summary="Trace a specific request through logs")
def get_request_trace(
    request_id: str,
    module: Optional[str] = Query(
        None,
        description="Limit search to a specific module log (chatbot / translator / …). "
                    "Defaults to searching all module logs.",
    ),
) -> dict:
    """
    Search log files for all entries that contain *request_id* and return
    them in chronological order.
    """
    allowed = {"chatbot", "translator", "intent_engine", "api"}
    modules_to_search = [module] if module and module in allowed else list(allowed)

    matched: list = []
    for mod in modules_to_search:
        log_file = _LOG_DIR / f"{mod}.log"
        if not log_file.exists():
            continue
        with open(log_file, "r", encoding="utf-8", errors="replace") as fh:
            for line in fh:
                if request_id in line:
                    matched.append({"module": mod, "line": line.rstrip()})

    return {
        "request_id": request_id,
        "modules_searched": modules_to_search,
        "total_matches": len(matched),
        "trace": matched,
    }
