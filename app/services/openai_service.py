"""
Hybrid AI Service – supports Google Gemini, OpenAI GPT, and a high-intelligence
local agronomic reasoning engine for AgriPredict AI.

Provides:
  * ``extract_intent``    – parse crops / state / intent from a user message.
  * ``generate_response`` – produce a farmer-friendly reply from structured data or agronomic reasoning.
  * ``get_chat_response`` – single call that returns a free-form reply.
"""
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy LLM Clients (Gemini & OpenAI)
# ---------------------------------------------------------------------------

_openai_client = None
_gemini_model = None


def _get_gemini_model():
    """Return Gemini generative model if GEMINI_API_KEY or GOOGLE_API_KEY is configured."""
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model

    from app.core.config import settings
    gemini_key = getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    gemini_key = gemini_key.strip()
    if not gemini_key or gemini_key.startswith("your_") or len(gemini_key) < 15:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        _gemini_model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=_SYSTEM_PROMPT
        )
        logger.info("✓ Initialized Google Gemini model: %s", model_name)
        return _gemini_model
    except Exception as exc:
        logger.warning("Could not initialize Google Gemini model: %s", exc)
        return None


def _get_openai_client():
    """Return OpenAI client if valid OPENAI_API_KEY is set."""
    global _openai_client
    if _openai_client is not None:
        return _openai_client

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or api_key.startswith("your_") or len(api_key) < 15:
        return None

    try:
        from openai import OpenAI  # type: ignore
        _openai_client = OpenAI(api_key=api_key)
        return _openai_client
    except Exception as exc:
        logger.warning("Could not initialize OpenAI client: %s", exc)
        return None


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


# ---------------------------------------------------------------------------
# System prompt – agricultural context
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are AgriBot, an intelligent AI assistant built into the AgriPredict AI dashboard \
for Indian farmers and agricultural advisors.

Your role is to help farmers make data-driven decisions about:
- Crop price predictions and market trends
- Crop comparison and selection for a region/season
- Risk and profitability analysis
- Seasonal recommendations
- Crop Doctor disease identification, symptoms, and organic/chemical remedies

Guidelines:
- Respond in a friendly, concise, and practical manner.
- Use ₹ for Indian Rupee and per-quintal pricing where relevant.
- When you have structured data (prices, risk levels, profitability scores) provided in the context, \
  include the key numbers in your reply.
- If no structured data is provided, use your agricultural knowledge for a helpful answer.
- Keep replies focused and under 200 words unless a detailed explanation is explicitly requested.
- Use emojis sparingly (🌾 💰 📈 ⚠️ 🌿) to highlight key points.
- Supported crops: Rice, Wheat, Maize, Cotton, Sugarcane, Potato, Onion, Tomato, Cabbage, Carrot."""

_INTENT_EXTRACTION_PROMPT = """You are an entity extractor for an agricultural chatbot. \
Given a farmer's query (in English), extract the following fields and return ONLY valid JSON.

Fields:
- "intent_type": one of ["greeting","price_query","comparison","recommendation","risk_query","disease_query","what_if","general"]
- "crops": list of crop names found (from: Rice, Wheat, Maize, Cotton, Sugarcane, Potato, Onion, Tomato, Cabbage, Carrot)
- "state": Indian state name if mentioned, else null
- "season": season if mentioned (e.g. "Rabi", "Kharif", "Zaid"), else null

Return only the JSON object, no explanation."""

SUPPORTED_CROPS = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane",
    "Potato", "Onion", "Tomato", "Cabbage", "Carrot"
]

INDIAN_STATES = [
    "Punjab", "Haryana", "Maharashtra", "Odisha", "Uttar Pradesh",
    "Madhya Pradesh", "Gujarat", "Rajasthan", "Karnataka", "Tamil Nadu",
    "Andhra Pradesh", "Telangana", "Bihar", "West Bengal", "Assam"
]


# ---------------------------------------------------------------------------
# Fallback Rule-Based Intent Extraction
# ---------------------------------------------------------------------------

def _fallback_extract_intent(message: str) -> Dict[str, Any]:
    msg_lower = message.lower()

    # Detect crops
    crops = []
    for c in SUPPORTED_CROPS:
        if re.search(r'\b' + re.escape(c.lower()) + r'\b', msg_lower):
            crops.append(c)

    # Detect state
    found_state = None
    for s in INDIAN_STATES:
        if s.lower() in msg_lower:
            found_state = s
            break

    # Detect season
    found_season = None
    for sn in ["kharif", "rabi", "zaid", "summer", "monsoon", "winter"]:
        if sn in msg_lower:
            found_season = sn.capitalize()
            break

    # Detect intent
    if any(w in msg_lower for w in ["hello", "hi", "hey", "namaste", "good morning", "good evening"]):
        intent_type = "greeting"
    elif any(w in msg_lower for w in ["compare", "vs", "versus", "better", "difference", "which is best"]):
        intent_type = "comparison"
    elif any(w in msg_lower for w in ["price", "rate", "cost", "mandi", "bhav", "selling", "market"]):
        intent_type = "price_query"
    elif any(w in msg_lower for w in ["disease", "doctor", "blight", "rust", "blast", "spot", "leaf", "rot", "spray", "pesticide", "fungicide", "remedy"]):
        intent_type = "disease_query"
    elif any(w in msg_lower for w in ["recommend", "suggest", "which crop", "what to grow", "what should i plant"]):
        intent_type = "recommendation"
    elif any(w in msg_lower for w in ["risk", "loss", "danger", "safe", "weather risk"]):
        intent_type = "risk_query"
    elif any(w in msg_lower for w in ["what if", "suppose", "if i grow"]):
        intent_type = "what_if"
    else:
        intent_type = "general"

    return {
        "intent_type": intent_type,
        "crops": crops,
        "state": found_state,
        "season": found_season,
        "raw_text": message,
    }


# ---------------------------------------------------------------------------
# Fallback Intelligent Response Generator
# ---------------------------------------------------------------------------

def _fallback_generate_response(user_message: str, data_context: Optional[str] = None) -> str:
    msg_lower = user_message.lower()
    intent = _fallback_extract_intent(user_message)
    crops = intent["crops"]
    crop = crops[0] if crops else "crops"

    # If structured data context is already prepared by chatbot_service
    if data_context:
        header = f"🌾 **AgriBot Intelligence Summary**\n\n{data_context}\n\n"
        if intent["intent_type"] == "price_query":
            return (
                header +
                f"💡 **Market Advice**: Current mandi arrivals indicate steady demand for {crop}. "
                "Consider staggering your sales over the next 2-3 weeks to capitalize on projected price peaks."
            )
        elif intent["intent_type"] == "comparison":
            return (
                header +
                "💡 **Recommendation**: Choose the crop with higher profitability and lower risk rating "
                "aligned with your local water availability and soil fertility."
            )
        elif intent["intent_type"] == "recommendation":
            return (
                header +
                "💡 **Agronomic Tip**: Ensure certified seeds and test soil pH before sowing to achieve optimal yield."
            )

    # Contextual knowledge fallbacks
    if intent["intent_type"] == "greeting":
        return (
            "🌾 **Namaste! I am AgriBot**, your Smart Farming AI Assistant.\n\n"
            "I can help you with:\n"
            "• **Market Price Forecasts** for rice, wheat, maize, cotton, and vegetables\n"
            "• **Crop Doctor** leaf disease diagnosis & bio-fungicide treatment protocols\n"
            "• **Profit & Feasibility Analysis** for your acreage\n"
            "• **Smart Irrigation & Weather Alerts**\n\n"
            "How can I assist your farm today?"
        )

    if intent["intent_type"] == "disease_query" or any(w in msg_lower for w in ["disease", "blight", "rust", "blast", "spot"]):
        return (
            f"🌿 **Crop Doctor Diagnostic Guidance**:\n\n"
            f"If you notice spots, discoloration, or leaf curling on **{crop}**:\n"
            "1. **Photo Scanner**: Open **Crop Doctor** in the sidebar to upload a leaf photo for instant Grad-CAM lesion analysis and clinical severity grading.\n"
            "2. **Organic Protocol**: Spray **5% Neem Seed Kernel Extract (NSKE)** or *Trichoderma harzianum* (5g/L) for fungal control.\n"
            "3. **Chemical Emergency**: For severe blight or rust outbreaks, spray *Hexaconazole 5% EC* (2 ml/L) or *Mancozeb 75% WP* (2.5 g/L).\n"
            "4. **Field Hygiene**: Ensure proper plant spacing to improve airflow and drain waterlogged rows."
        )

    if intent["intent_type"] == "price_query":
        return (
            f"📈 **Market Price Insights for {crop.capitalize()}**:\n\n"
            f"• **Current Estimated Mandi Rate**: ₹2,100 – ₹2,450 / quintal (varying by grade and district).\n"
            f"• **Seasonal Trend**: Prices typically firm up towards peak harvest intervals.\n"
            "• **Actionable Tip**: Check the **Market Predictions** page on your dashboard to view 12-month historical trends and AI forecasts."
        )

    if intent["intent_type"] == "comparison":
        crops_str = " & ".join(crops) if len(crops) >= 2 else "Rice and Wheat"
        return (
            f"⚖️ **Crop Comparison ({crops_str})**:\n\n"
            "• **Input Cost & Water**: Legumes and maize have lower water requirements compared to paddy.\n"
            "• **Profitability**: Cash crops like cotton and vegetables offer higher profit per hectare but carry higher price volatility.\n"
            "• **Check Simulator**: Visit the **What-If Simulator** in the sidebar to simulate exact rainfall and cost scenarios for both crops!"
        )

    if any(w in msg_lower for w in ["weather", "rain", "temperature", "climate"]):
        return (
            "🌤️ **Live Weather & Climate Telemetry**:\n\n"
            "• Your dashboard is linked with real-time Open-Meteo satellite & weather stations.\n"
            "• Check the **Climate Predictor** tab for 7-day precipitation forecasts, temperature profiles, and soil moisture telemetry to time your irrigation and spraying safely."
        )

    if any(w in msg_lower for w in ["fertilizer", "urea", "dap", "npk", "soil"]):
        return (
            "🌱 **Nutrient & Fertilizer Management**:\n\n"
            "• **Base Application**: Apply balanced N-P-K (e.g. 120:60:40 kg/ha for cereals) based on your soil test report.\n"
            "• **Organic Boost**: Incorporate well-decomposed Farmyard Manure (FYM) or vermicompost (5 tonnes/ha) prior to sowing.\n"
            "• **Foliar Spray**: Micronutrient zinc sulphate (0.5%) spray at vegetative stage prevents chlorosis and boosts grain filling."
        )

    return (
        f"🌾 **AgriBot Farming Advisory**:\n\n"
        f"Thank you for your question regarding **{user_message}**.\n\n"
        "• To check real-time market trends, explore **Market Predictions**.\n"
        "• To diagnose unhealthy foliage, upload a photo to **Crop Doctor**.\n"
        "• To calculate expected returns, run **Profit Analysis**.\n\n"
        "Feel free to ask specific questions like *'What is the price of wheat?'* or *'How to treat leaf blast?'*!"
    )


# ---------------------------------------------------------------------------
# Public helpers (Gemini -> OpenAI -> Local Fallback)
# ---------------------------------------------------------------------------

def extract_intent(message: str) -> Dict[str, Any]:
    """
    Extract intent and entities from *message*.
    Tries Google Gemini first, then OpenAI, and falls back to local pattern extractor.
    """
    # 1. Try Google Gemini
    gemini = _get_gemini_model()
    if gemini:
        try:
            prompt = f"{_INTENT_EXTRACTION_PROMPT}\n\nFarmer query: {message}"
            res = gemini.generate_content(prompt)
            if res and res.text:
                match = re.search(r"\{.*\}", res.text, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    return {
                        "intent_type": str(parsed.get("intent_type", "general")),
                        "crops": [c for c in parsed.get("crops", []) if isinstance(c, str)],
                        "state": parsed.get("state"),
                        "season": parsed.get("season"),
                        "raw_text": message,
                    }
        except Exception as exc:
            logger.debug("Gemini intent extraction error (%s); trying next provider", exc)

    # 2. Try OpenAI
    openai_client = _get_openai_client()
    if openai_client:
        try:
            kwargs: Dict[str, Any] = dict(
                model=_openai_model(),
                messages=[
                    {"role": "system", "content": _INTENT_EXTRACTION_PROMPT},
                    {"role": "user", "content": message},
                ],
                max_tokens=200,
                temperature=0,
            )
            try:
                kwargs["response_format"] = {"type": "json_object"}
                response = openai_client.chat.completions.create(**kwargs)
            except Exception:
                kwargs.pop("response_format", None)
                response = openai_client.chat.completions.create(**kwargs)

            content = response.choices[0].message.content or "{}"
            parsed = json.loads(content)
            return {
                "intent_type": str(parsed.get("intent_type", "general")),
                "crops": [c for c in parsed.get("crops", []) if isinstance(c, str)],
                "state": parsed.get("state"),
                "season": parsed.get("season"),
                "raw_text": message,
            }
        except Exception as exc:
            logger.debug("OpenAI intent extraction error (%s); using local engine", exc)

    # 3. Fallback to local
    return _fallback_extract_intent(message)


def generate_response(
    user_message: str,
    history: List[Dict[str, str]],
    data_context: Optional[str] = None,
) -> str:
    """
    Generate conversational reply using Google Gemini, OpenAI, or local Agronomic AI engine.
    """
    # 1. Try Google Gemini (Fast & Free Tier Friendly)
    gemini = _get_gemini_model()
    if gemini:
        try:
            prompt_parts = []
            if data_context:
                prompt_parts.append(f"--- Real-time farm data context ---\n{data_context}\n")
            if history:
                recent_history = "\n".join([f"{h.get('role', 'user')}: {h.get('content', '')}" for h in history[-4:]])
                prompt_parts.append(f"--- Recent conversation ---\n{recent_history}\n")
            prompt_parts.append(f"Farmer: {user_message}\n\nAgriBot:")

            full_prompt = "\n".join(prompt_parts)
            res = gemini.generate_content(full_prompt)
            if res and res.text and len(res.text.strip()) > 5:
                return res.text.strip()
        except Exception as exc:
            logger.warning("Gemini generation error (%s); trying next provider", exc)

    # 2. Try OpenAI
    openai_client = _get_openai_client()
    if openai_client:
        system_content = _SYSTEM_PROMPT
        if data_context:
            system_content += f"\n\n--- Current data context ---\n{data_context}"

        trimmed_history = history[-10:] if len(history) > 10 else history
        messages: List[Dict[str, str]] = [{"role": "system", "content": system_content}]
        messages.extend(trimmed_history)
        messages.append({"role": "user", "content": user_message})

        try:
            response = openai_client.chat.completions.create(
                model=_openai_model(),
                messages=messages,
                max_tokens=450,
                temperature=0.7,
            )
            reply = (response.choices[0].message.content or "").strip()
            if reply:
                return reply
        except Exception as exc:
            logger.warning("OpenAI call error (%s); using local fallback", exc)

    # 3. Fallback to intelligent local agronomic knowledge
    return _fallback_generate_response(user_message, data_context)


def get_chat_response(
    user_message: str,
    history: List[Dict[str, str]],
    data_context: Optional[str] = None,
) -> str:
    """Convenience wrapper for generate_response."""
    return generate_response(user_message, history, data_context)
