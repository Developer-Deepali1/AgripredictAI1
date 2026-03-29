"""
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
