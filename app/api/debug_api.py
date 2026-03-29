"""
Debug API – lightweight endpoints for testing individual pipeline components.

Mount with prefix ``/api/debug`` (added in ``app/main.py``).

All endpoints are intentionally **not** protected by auth so that
developers / CI pipelines can exercise them without credentials.
Remove or restrict these in a hardened production deployment.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.core.logger import LOG_DIR, api_logger

router = APIRouter(prefix="/api/debug", tags=["Debug"])


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
    # Validate request_id (alphanumeric + hyphens, max 36 chars for UUID)
    if not request_id.replace("-", "").isalnum() or len(request_id) > 36:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request_id format.",
        )

    matches: list = []
    try:
        log_files = (
            [LOG_DIR / f"{module}.log"]
            if module and (module.replace("_", "").isalnum())
            else sorted(LOG_DIR.glob("*.log"), key=lambda f: f.stat().st_mtime)
        )
        for log_file in log_files:
            if not log_file.exists():
                continue
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


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@router.get("/health", summary="Component health check")
def debug_health() -> dict:
    """
    Check availability of optional dependencies used by the chatbot pipeline.
    """
    components: dict = {}

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
