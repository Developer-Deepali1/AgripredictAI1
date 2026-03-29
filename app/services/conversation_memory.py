"""
Conversation Memory – in-memory session-based conversation history.

Stores the last N (default 5) turns per session so the chatbot
can maintain context across multiple queries.
"""
import logging
from collections import deque
from datetime import datetime, timezone
from typing import Dict, Deque, List, Any, Optional

logger = logging.getLogger(__name__)

# Maximum turns kept per session
_MAX_TURNS = 5

# session_id → deque of turn dicts
_sessions: Dict[str, Deque[dict]] = {}


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def add_turn(session_id: str, role: str, content: str, structured_data: Optional[dict] = None) -> None:
    """Append a conversation turn for *session_id*."""
    if session_id not in _sessions:
        _sessions[session_id] = deque(maxlen=_MAX_TURNS)
    turn = {
        "role": role,
        "content": content,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "structured_data": structured_data,
    }
    _sessions[session_id].append(turn)
    logger.debug("Memory add [%s] %s: %s…", session_id, role, content[:60])


def get_history(session_id: str) -> List[dict]:
    """Return the conversation history for *session_id* (oldest first)."""
    return list(_sessions.get(session_id, []))


def get_context(session_id: str) -> Dict[str, Any]:
    """
    Extract context variables from previous turns.

    Returns a dict that may contain:
        last_crop, last_state, last_intent
    """
    history = get_history(session_id)
    ctx: Dict[str, Any] = {}
    for turn in reversed(history):
        sd = turn.get("structured_data") or {}
        if "last_crop" not in ctx and sd.get("crop"):
            ctx["last_crop"] = sd["crop"]
        if "last_state" not in ctx and sd.get("state"):
            ctx["last_state"] = sd["state"]
        if "last_intent" not in ctx and sd.get("intent_type"):
            ctx["last_intent"] = sd["intent_type"]
        if len(ctx) == 3:
            break
    return ctx


def clear_history(session_id: str) -> None:
    """Delete all conversation history for *session_id*."""
    _sessions.pop(session_id, None)
    logger.debug("Memory cleared for session %s", session_id)


def session_count() -> int:
    """Return the number of active sessions (for monitoring)."""
    return len(_sessions)
