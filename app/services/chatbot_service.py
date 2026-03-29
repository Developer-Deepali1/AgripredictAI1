"""
Chatbot Service – core logic that ties together intent parsing,
prediction, risk analysis, comparison, translation, and TTS.
"""
import logging
import os
from datetime import date
from typing import Optional, List, Dict, Any

from app.core.constants import SUPPORTED_CROPS
from app.engines import intent_engine, comparison_engine, risk_analyzer
from app.services import conversation_memory
from app.utils import language_detector, translator, text_to_speech, prompt_templates
from app.utils.constants import SUPPORTED_LANGUAGES

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Price helper (duplicates prediction_api logic to avoid HTTP round-trip)
# ---------------------------------------------------------------------------
_BASE_PRICES: dict = {
    "Rice": 21.0, "Wheat": 23.0, "Maize": 15.0, "Cotton": 55.0,
    "Sugarcane": 3.5, "Potato": 8.0, "Onion": 15.0, "Tomato": 18.0,
    "Cabbage": 7.0, "Carrot": 10.0,
}
_SEASONALITY: dict = {
    "Rice":      [0.9, 0.85, 0.9, 1.0, 1.1, 1.2, 1.1, 0.95, 0.85, 0.9, 1.0, 1.05],
    "Wheat":     [1.1, 1.15, 1.2, 1.0, 0.85, 0.8, 0.85, 0.9, 1.0, 1.05, 1.1, 1.15],
    "Maize":     [1.0, 1.05, 1.0, 0.95, 0.9, 0.85, 0.9, 1.0, 1.1, 1.15, 1.1, 1.05],
    "Cotton":    [1.0, 1.0, 1.05, 1.1, 1.15, 1.1, 1.0, 0.95, 0.9, 0.9, 0.95, 1.0],
    "Sugarcane": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.05, 1.05, 1.0],
    "Potato":    [1.2, 1.1, 1.0, 0.85, 0.8, 0.9, 1.0, 1.1, 1.15, 1.2, 1.25, 1.3],
    "Onion":     [1.3, 1.2, 1.0, 0.8, 0.7, 0.8, 1.0, 1.1, 1.2, 1.3, 1.4, 1.35],
    "Tomato":    [1.1, 1.0, 0.9, 0.85, 1.0, 1.3, 1.4, 1.2, 1.0, 0.9, 0.95, 1.1],
    "Cabbage":   [1.1, 1.05, 0.95, 0.85, 0.8, 0.9, 1.0, 1.05, 1.1, 1.15, 1.2, 1.15],
    "Carrot":    [1.1, 1.0, 0.9, 0.85, 0.9, 1.0, 1.05, 1.1, 1.15, 1.2, 1.2, 1.15],
}


def _price_qtl(crop: str, month: int) -> float:
    base = _BASE_PRICES.get(crop, 10.0)
    season = _SEASONALITY.get(crop, [1.0] * 12)[month - 1]
    return round(base * season * 100, 2)   # ₹/quintal


def _make_suggestions(intent: str, crops: List[str], state: Optional[str]) -> List[str]:
    suggestions: List[str] = []
    if intent == "price_query" and crops:
        crop = crops[0]
        others = [c for c in SUPPORTED_CROPS if c != crop][:2]
        for o in others:
            suggestions.append(f"Compare {crop} with {o}?")
        suggestions.append("What are the risks?")
    elif intent == "comparison":
        suggestions.append("Tell me more about the recommended crop.")
        if state:
            suggestions.append(f"Best crop for {state} next season?")
        suggestions.append("What about profitability?")
    elif intent in ("recommendation", "what_if"):
        suggestions.append("What are the risks?")
        suggestions.append("Show price trends.")
        if crops:
            suggestions.append(f"Compare {crops[0]} with another crop?")
    else:
        suggestions = [
            "What crop is best this month?",
            "Compare rice and wheat.",
            "Check risks for cotton.",
        ]
    return suggestions[:3]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def process_message(
    message: str,
    language: str,
    session_id: str,
) -> Dict[str, Any]:
    """
    Process a user message and return a response dict.

    Returns:
        {
            reply_text, reply_audio_url, structured_data,
            comparison, suggestions, detected_language, session_id
        }
    """
    # 1) Language detection (use provided language if given, else auto-detect)
    if language not in SUPPORTED_LANGUAGES:
        language = "en"
    if language == "en":
        detected_lang = language_detector.detect_language(message)
        if detected_lang != "en":
            language = detected_lang
    detected_language = language

    # 2) Translate to English for NLP processing
    en_message = translator.translate_text(message, src=language, dest="en")

    # 3) Enrich with conversation context
    ctx = conversation_memory.get_context(session_id)
    if not en_message.strip():
        en_message = message  # safety fallback

    # Inject context crop/state when message is a follow-up
    if ctx.get("last_crop") and ctx["last_crop"].lower() not in en_message.lower():
        en_message_enriched = f"{en_message} (about {ctx['last_crop']})"
    else:
        en_message_enriched = en_message

    # 4) Parse intent
    intent = intent_engine.parse_intent(en_message_enriched)
    intent_type = intent["intent_type"]
    crops: List[str] = intent["crops"]
    state: Optional[str] = intent["state"] or ctx.get("last_state")
    season: Optional[str] = intent.get("season")

    month = date.today().month

    # 5) Build response
    reply_en = ""
    structured_data: Optional[Dict[str, Any]] = None
    comparison_list: Optional[List[Dict[str, Any]]] = None

    if intent_type == "greeting":
        reply_en = prompt_templates.greeting_template()

    elif intent_type == "comparison" or (intent_type == "what_if" and len(crops) >= 2):
        if len(crops) < 2:
            # Need at least 2 crops; fall back to top 2 supported
            crops = list(SUPPORTED_CROPS[:2])
        ranked = comparison_engine.compare_crops(crops, state, month)
        reply_en = prompt_templates.comparison_template(ranked, state)
        comparison_list = ranked
        if ranked:
            best = ranked[0]
            structured_data = {
                "crop": best["crop"],
                "state": state,
                "predicted_price": best["predicted_price"],
                "demand_level": best["demand_level"],
                "risk_level": best["risk_level"],
                "profitability": best["profitability"],
                "intent_type": intent_type,
            }

    elif intent_type in ("price_query", "what_if", "risk_query", "profitability"):
        if not crops:
            crops = [ctx.get("last_crop", SUPPORTED_CROPS[0])]
        crop = crops[0]
        price = _price_qtl(crop, month)
        analysis = risk_analyzer.analyse(crop, state or "", month)
        trend_mult = _SEASONALITY.get(crop, [1.0] * 12)
        next_month_idx = month % 12  # next month (0-indexed)
        trend = "UP" if trend_mult[next_month_idx] > trend_mult[month - 1] else (
            "DOWN" if trend_mult[next_month_idx] < trend_mult[month - 1] else "STABLE"
        )
        reply_en = prompt_templates.single_crop_template(
            crop=crop,
            state=state,
            price=price,
            demand=analysis["demand_level"],
            risk=analysis["risk_level"],
            profitability=analysis["profitability"],
            trend=trend,
        )
        structured_data = {
            "crop": crop,
            "state": state,
            "predicted_price": price,
            "demand_level": analysis["demand_level"],
            "risk_level": analysis["risk_level"],
            "profitability": analysis["profitability"],
            "confidence": round(1.0 - analysis["risk_score"], 2),
            "trend": trend,
            "explanation": analysis["explanation"],
            "intent_type": intent_type,
        }

    elif intent_type == "recommendation":
        target_crops = crops if crops else list(SUPPORTED_CROPS)
        best_crop = comparison_engine.recommend_best_crop(target_crops, state, month)
        if not best_crop:
            best_crop = SUPPORTED_CROPS[0]
        reply_en = prompt_templates.recommendation_template(best_crop, state, season or "current")
        analysis = risk_analyzer.analyse(best_crop, state or "", month)
        structured_data = {
            "crop": best_crop,
            "state": state,
            "demand_level": analysis["demand_level"],
            "risk_level": analysis["risk_level"],
            "profitability": analysis["profitability"],
            "intent_type": intent_type,
        }

    else:
        reply_en = prompt_templates.fallback_template()

    # 6) Translate response back to user language
    if detected_language != "en" and reply_en:
        reply_final = translator.translate_text(reply_en, src="en", dest=detected_language)
    else:
        reply_final = reply_en

    # 7) Generate TTS audio (best-effort)
    audio_url: Optional[str] = None
    try:
        audio_path = text_to_speech.synthesize_speech(reply_final, detected_language)
        if audio_path:
            filename = os.path.basename(audio_path)
            audio_url = f"/api/chat/audio/{filename}"
    except Exception as exc:
        logger.warning("TTS generation failed: %s", exc)

    # 8) Build suggestions
    suggestions = _make_suggestions(intent_type, crops, state)

    # 9) Persist to conversation memory
    conversation_memory.add_turn(session_id, "user", message, {"intent_type": intent_type})
    conversation_memory.add_turn(
        session_id, "assistant", reply_final, structured_data
    )

    return {
        "reply_text": reply_final,
        "reply_audio_url": audio_url,
        "structured_data": structured_data,
        "comparison": comparison_list,
        "suggestions": suggestions,
        "detected_language": detected_language,
        "session_id": session_id,
    }
