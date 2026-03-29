"""
Error handling utilities for the AgriPredictAI chatbot pipeline.

Provides:
  * ``ErrorCode`` – enumeration of structured error codes.
  * ``ChatbotException`` – base exception with error code, message, and details.
  * ``handle_error`` – converts an exception into a user-friendly response dict.
"""
import traceback
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional

from app.core.logger import chatbot_logger


# ---------------------------------------------------------------------------
# Error codes
# ---------------------------------------------------------------------------

class ErrorCode(Enum):
    """Structured error codes for each pipeline stage."""
    LANGUAGE_DETECTION_FAILED   = "LD_001"
    TRANSLATION_FAILED          = "TR_001"
    INTENT_EXTRACTION_FAILED    = "IE_001"
    API_CALL_FAILED             = "API_001"
    RESPONSE_GENERATION_FAILED  = "RG_001"
    VOICE_PROCESSING_FAILED     = "VP_001"
    UNKNOWN_ERROR               = "UNK_001"


# ---------------------------------------------------------------------------
# Custom exception
# ---------------------------------------------------------------------------

class ChatbotException(Exception):
    """
    Exception raised at a specific stage of the chatbot pipeline.

    Attributes:
        error_code: One of the :class:`ErrorCode` members.
        message:    Human-readable description of the failure.
        details:    Optional dict with extra context (inputs, partial results …).
        tb:         Formatted traceback at the point of construction.
  * ``ErrorCode``       – machine-readable error codes for each failure stage
  * ``ChatbotException``– structured exception that auto-logs on creation
  * ``handle_error``    – converts any exception to a JSON-safe dict
"""
import traceback
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
import logging

_logger = logging.getLogger("chatbot")


class ErrorCode(Enum):
    """Unique codes for each failure category in the chatbot pipeline."""

    LANGUAGE_DETECTION_FAILED = "LD_001"
    TRANSLATION_FAILED        = "TR_001"
    INTENT_EXTRACTION_FAILED  = "IE_001"
    API_CALL_FAILED           = "API_001"
    RESPONSE_GENERATION_FAILED = "RG_001"
    VOICE_PROCESSING_FAILED   = "VP_001"
    UNKNOWN_ERROR             = "UNK_001"


class ChatbotException(Exception):
    """
    Structured exception for the chatbot pipeline.

    Automatically logs ``error_code`` + ``message`` + ``details`` at
    ERROR level when instantiated.
    """

    def __init__(
        self,
        error_code: ErrorCode,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.details: Dict[str, Any] = details or {}
        self.tb = traceback.format_exc()

        chatbot_logger.error(
            "Error %s: %s | details=%s",
        self.request_id = request_id
        self.tb = traceback.format_exc()
        self.timestamp = datetime.utcnow().isoformat()

        rid = f"[{request_id}] " if request_id else ""
        _logger.error(
            "%s%s: %s | details=%s",
            rid,
            error_code.value,
            message,
            self.details,
        )


# ---------------------------------------------------------------------------
# Helper: convert any exception to a response dict
# ---------------------------------------------------------------------------

def handle_error(
    error: Exception,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Convert *error* to a structured response dict suitable for API consumers.

    The dict always contains:
      * ``error``      – short human-readable message.
      * ``error_code`` – string error code.
      * ``details``    – dict with extra context.
      * ``timestamp``  – ISO-8601 UTC timestamp.
      * ``request_id`` – echoed back when provided.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    base: Dict[str, Any] = {"timestamp": timestamp}
    if request_id is not None:
        base["request_id"] = request_id

    if isinstance(error, ChatbotException):
        return {
            **base,
            "error": error.message,
            "error_code": error.error_code.value,
            "details": error.details,
        }

    return {
        **base,
        "error": "An unexpected error occurred. Please try again.",
        "error_code": ErrorCode.UNKNOWN_ERROR.value,
        "details": {"exception": str(error)},
    Convert any exception into a JSON-safe response dict.

    Returns a dict with ``error``, ``error_code``, ``details``,
    ``request_id``, and ``timestamp`` keys.
    """
    ts = datetime.utcnow().isoformat()
    rid = request_id or ""

    if isinstance(error, ChatbotException):
        return {
            "error": error.message,
            "error_code": error.error_code.value,
            "details": error.details,
            "request_id": rid,
            "timestamp": ts,
        }

    _logger.error(
        "[%s] Unexpected error: %s",
        rid,
        error,
        exc_info=True,
    )
    return {
        "error": "An unexpected error occurred.",
        "error_code": ErrorCode.UNKNOWN_ERROR.value,
        "details": {"exception": str(error)},
        "request_id": rid,
        "timestamp": ts,
    }
