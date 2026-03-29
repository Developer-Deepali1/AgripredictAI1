"""
Intent Engine – parses natural-language queries from farmers.

Extracts:
  * intent_type  (price_query / comparison / recommendation / risk_query /
                  profitability / what_if / greeting / general)
  * crops        (list of canonical crop names)
  * state        (canonical Indian state name, optional)
  * season       (kharif / rabi / zaid, optional)

Logging is written to ``logs/intent_engine.log`` via the centralized logger.
"""
import re
from typing import Dict, List, Optional, Any
from datetime import date

from app.core.constants import SUPPORTED_CROPS
from app.core.logger import intent_logger as logger
from app.core.logger import intent_logger as logger  # file-backed structured logger
from app.utils.constants import (
    CROP_ALIASES,
    STATE_ALIASES,
    INDIAN_STATES,
    KHARIF_MONTHS,
    RABI_MONTHS,
    ZAID_MONTHS,
)

# ---------------------------------------------------------------------------
# Pre-compiled patterns
# ---------------------------------------------------------------------------
_GREETING_PAT = re.compile(
    r"\b(hello|hi|hey|namaste|namaskar|jai|howdy|good\s+(morning|evening|afternoon))\b",
    re.I,
)
_COMPARE_PAT = re.compile(
    r"\b(compare|vs\.?|versus|better|between|or|difference|which\s+is\s+better)\b",
    re.I,
)
_RECOMMEND_PAT = re.compile(
    r"\b(recommend|suggest|best\s+crop|which\s+crop|what\s+crop|should\s+i\s+(grow|plant|sow))\b",
    re.I,
)
_RISK_PAT = re.compile(r"\b(risk|danger|safe|unsafe|hazard)\b", re.I)
_PROFIT_PAT = re.compile(r"\b(profit|profitable|earn|income|return|revenue|benefit)\b", re.I)
_WHATIF_PAT = re.compile(r"\b(what\s+if|if\s+i\s+(grow|plant|sow)|scenario)\b", re.I)
_PRICE_PAT  = re.compile(r"\b(price|cost|rate|market\s+price|msp|mandi)\b", re.I)
_SEASON_KHARIF = re.compile(r"\b(kharif|monsoon|rainy)\b", re.I)
_SEASON_RABI   = re.compile(r"\b(rabi|winter|winter\s+crop)\b", re.I)
_SEASON_ZAID   = re.compile(r"\b(zaid|summer|spring)\b", re.I)


def _normalise_crop(word: str) -> Optional[str]:
    """Return canonical crop name or None."""
    # Direct match (case-insensitive)
    for c in SUPPORTED_CROPS:
        if c.lower() == word.lower():
            return c
    # Alias match
    return CROP_ALIASES.get(word.lower())


def _extract_crops(text: str) -> List[str]:
    """Extract all crop mentions from text."""
    found: List[str] = []
    words = re.sub(r"[^\w\s]", " ", text).split()
    # Also check bigrams (e.g. "band gobhi")
    bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]
    candidates = bigrams + words
    seen: set = set()
    for w in candidates:
        c = _normalise_crop(w)
        if c and c not in seen:
            found.append(c)
            seen.add(c)
    return found


def _extract_state(text: str) -> Optional[str]:
    """Extract Indian state name from text."""
    text_lower = text.lower()

    # 1) Check aliases first (short codes like "up", "mp")
    for alias, canonical in STATE_ALIASES.items():
        # Use word-boundary to avoid partial matches
        if re.search(r"\b" + re.escape(alias) + r"\b", text_lower):
            return canonical

    # 2) Full state names (longest match first to handle "Jammu and Kashmir")
    for state in sorted(INDIAN_STATES, key=len, reverse=True):
        if state.lower() in text_lower:
            return state

    return None


def _detect_season(text: str) -> Optional[str]:
    """Detect season keyword or infer from current month."""
    if _SEASON_KHARIF.search(text):
        return "Kharif"
    if _SEASON_RABI.search(text):
        return "Rabi"
    if _SEASON_ZAID.search(text):
        return "Zaid"

    # Infer from current month
    m = date.today().month
    if m in KHARIF_MONTHS:
        return "Kharif"
    if m in RABI_MONTHS:
        return "Rabi"
    return "Zaid"


def parse_intent(text: str) -> Dict[str, Any]:
    """
    Parse natural-language query and return an intent dict:

    {
        "intent_type": str,
        "crops": List[str],
        "state": Optional[str],
        "season": Optional[str],
        "raw_text": str,
    }
    """
    result: Dict[str, Any] = {
        "intent_type": "general",
        "crops": [],
        "state": None,
        "season": None,
        "raw_text": text,
    }

    if not text or not text.strip():
        logger.warning("parse_intent called with empty text – returning 'general'")
        return result

    # Determine intent type (order matters – most specific first)
    if _GREETING_PAT.search(text):
        result["intent_type"] = "greeting"
    elif _WHATIF_PAT.search(text):
        result["intent_type"] = "what_if"
    elif _COMPARE_PAT.search(text):
        result["intent_type"] = "comparison"
    elif _RECOMMEND_PAT.search(text):
        result["intent_type"] = "recommendation"
    elif _RISK_PAT.search(text):
        result["intent_type"] = "risk_query"
    elif _PROFIT_PAT.search(text):
        result["intent_type"] = "profitability"
    elif _PRICE_PAT.search(text):
        result["intent_type"] = "price_query"

    result["crops"] = _extract_crops(text)
    result["state"] = _extract_state(text)
    result["season"] = _detect_season(text)

    logger.info(
        "Parsed intent: type=%s crops=%s state=%s season=%s | text='%s'",
        "Parsed intent: type=%s | crops=%s | state=%s | season=%s | text='%s'",
        result["intent_type"],
        result["crops"],
        result["state"],
        result["season"],
        text[:80],
    )
    return result
