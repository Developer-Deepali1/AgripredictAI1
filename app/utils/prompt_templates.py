"""
Response/prompt templates for the chatbot.
Keeps all natural-language strings in one place for easy editing.
"""
from typing import Optional


def single_crop_template(
    crop: str,
    state: Optional[str],
    price: float,
    demand: str,
    risk: str,
    profitability: float,
    trend: str,
) -> str:
    """Generate a farmer-friendly single-crop response."""
    state_part = f" in {state}" if state else ""
    trend_icon = "📈" if trend == "UP" else ("📉" if trend == "DOWN" else "➡️")
    demand_icon = "🔴" if demand == "LOW" else ("🟡" if demand == "MEDIUM" else "🟢")
    risk_icon = "🟢" if risk == "LOW" else ("🟡" if risk == "MEDIUM" else ("🔴" if risk == "HIGH" else "⛔"))

    return (
        f"🌾 **{crop}{state_part}** Analysis:\n\n"
        f"💰 Predicted Price: ₹{price:.0f}/qtl\n"
        f"{demand_icon} Demand Level: {demand}\n"
        f"{risk_icon} Risk Level: {risk}\n"
        f"📊 Profitability Score: {profitability:.0f}%\n"
        f"{trend_icon} Price Trend: {trend}\n\n"
        f"{'✅ Good time to grow!' if profitability >= 70 else '⚠️ Consider alternatives or manage risks carefully.'}"
    )


def comparison_template(crops_data: list, state: Optional[str]) -> str:
    """Generate a comparison response for multiple crops."""
    state_part = f" for {state}" if state else ""
    lines = [f"📊 **Crop Comparison{state_part}:**\n"]

    best = max(crops_data, key=lambda c: c["profitability"])

    for c in crops_data:
        is_best = c["crop"] == best["crop"]
        star = " ⭐ RECOMMENDED" if is_best else ""
        demand_icon = "🔴" if c["demand_level"] == "LOW" else ("🟡" if c["demand_level"] == "MEDIUM" else "🟢")
        risk_icon = "🟢" if c["risk_level"] == "LOW" else ("🟡" if c["risk_level"] == "MEDIUM" else "🔴")
        lines.append(
            f"🌾 **{c['crop']}{star}**\n"
            f"   💰 Price: ₹{c['predicted_price']:.0f}/qtl\n"
            f"   {demand_icon} Demand: {c['demand_level']}\n"
            f"   {risk_icon} Risk: {c['risk_level']}\n"
            f"   📊 Profitability: {c['profitability']:.0f}%\n"
        )

    if len(crops_data) >= 2:
        worst = min(crops_data, key=lambda c: c["profitability"])
        diff = best["profitability"] - worst["profitability"]
        lines.append(
            f"\n**{best['crop']}** is recommended with {diff:.0f}% better profitability "
            f"and {best['demand_level'].lower()} market demand."
        )

    return "\n".join(lines)


def recommendation_template(crop: str, state: Optional[str], season: str) -> str:
    """Generate a seasonal recommendation message."""
    state_part = f" in {state}" if state else ""
    return (
        f"🌱 For the **{season} season{state_part}**, "
        f"**{crop}** is a strong recommendation.\n"
        f"It aligns well with current market demand and weather conditions."
    )


def error_unknown_crop(crop_input: str, suggestions: list) -> str:
    sugg = ", ".join(suggestions[:3]) if suggestions else "Rice, Wheat, Maize"
    return (
        f"Sorry, I don't recognise **{crop_input}** as a supported crop. "
        f"Did you mean one of these? {sugg}"
    )


def error_no_data(crop: str) -> str:
    return (
        f"I don't have enough historical data for **{crop}** right now. "
        f"Based on general trends, please consult your local Krishi Kendra for guidance."
    )


def greeting_template() -> str:
    return (
        "👋 Hello! I'm your **AgriPredict AI Assistant**.\n\n"
        "I can help you with:\n"
        "• 🌾 Crop price predictions\n"
        "• ⚖️ Crop comparisons\n"
        "• 📍 Region-specific recommendations\n"
        "• ⚠️ Risk & profitability analysis\n\n"
        "Try asking: *\"What if I grow rice in Odisha?\"* or "
        "*\"Compare wheat and maize\"*"
    )


def fallback_template() -> str:
    return (
        "I'm not sure I understood that. Could you rephrase?\n\n"
        "You can ask things like:\n"
        "• \"What is the price of wheat?\"\n"
        "• \"Compare rice and cotton\"\n"
        "• \"Which crop is best for Punjab in Rabi season?\"\n"
        "• \"Is maize profitable right now?\""
    )
