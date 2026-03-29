"""
Centralized logging configuration for AgriPredictAI.

Creates module-specific loggers that write to both a rotating file
(DEBUG+) and the console (ERROR+).  All log files land in a ``logs/``
directory at the project root so they are easy to tail in production.
"""
import logging
import logging.handlers
from pathlib import Path

# ---------------------------------------------------------------------------
# Log directory – created automatically when this module is imported
# ---------------------------------------------------------------------------
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

_LOG_FORMAT = (
    "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
)


def setup_logger(name: str) -> logging.Logger:
    """
    Return a logger called *name* that:

    * writes DEBUG-and-above to ``logs/<name>.log`` (rotating, 5 MB × 3 backups)
    * writes ERROR-and-above to the console (stderr)

    Calling this function multiple times with the same name is idempotent –
    handlers are only added once.
    """
    log = logging.getLogger(name)

    if log.handlers:
        # Already configured – avoid duplicate handlers
        return log

    log.setLevel(logging.DEBUG)

    formatter = logging.Formatter(_LOG_FORMAT)

    # --- File handler (rotating) ---
    file_handler = logging.handlers.RotatingFileHandler(
        LOG_DIR / f"{name}.log",
        maxBytes=5 * 1024 * 1024,  # 5 MB
        backupCount=3,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # --- Console handler ---
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.ERROR)
    console_handler.setFormatter(formatter)

    log.addHandler(file_handler)
    log.addHandler(console_handler)

    return log


# ---------------------------------------------------------------------------
# Module-specific loggers – import these directly in other modules
# ---------------------------------------------------------------------------
chatbot_logger = setup_logger("chatbot")
translator_logger = setup_logger("translator")
intent_logger = setup_logger("intent_engine")
comparison_logger = setup_logger("comparison_engine")
risk_logger = setup_logger("risk_analyzer")
stt_logger = setup_logger("speech_to_text")
tts_logger = setup_logger("text_to_speech")
lang_detect_logger = setup_logger("language_detector")
api_logger = setup_logger("api")
