"""
Risk Analyzer Engine – calculates risk level and profitability score for a crop.
"""
from datetime import date

from app.core.constants import SUPPORTED_CROPS
from app.core.logger import risk_logger as logger

# ---------------------------------------------------------------------------
# Base risk scores per crop (0.0 = safest, 1.0 = riskiest)
# ---------------------------------------------------------------------------
_BASE_RISK: dict = {
    "Rice":      0.25,
    "Wheat":     0.20,
    "Maize":     0.30,
    "Cotton":    0.50,
    "Sugarcane": 0.20,
    "Potato":    0.45,
    "Onion":     0.55,
    "Tomato":    0.60,
    "Cabbage":   0.35,
    "Carrot":    0.30,
}

# Base profitability percentages
_BASE_PROFIT: dict = {
    "Rice":      72,
    "Wheat":     75,
    "Maize":     68,
    "Cotton":    78,
    "Sugarcane": 65,
    "Potato":    70,
    "Onion":     80,
    "Tomato":    74,
    "Cabbage":   62,
    "Carrot":    65,
}

# Month-wise seasonality multipliers (same as in prediction_api.py)
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

# Demand levels per month for each crop
_DEMAND_MAP: dict = {
    "Rice":      ["MED","LOW","MED","MED","HIGH","HIGH","HIGH","MED","LOW","MED","MED","MED"],
    "Wheat":     ["HIGH","HIGH","HIGH","MED","LOW","LOW","LOW","MED","MED","MED","HIGH","HIGH"],
    "Maize":     ["MED","MED","MED","MED","MED","LOW","MED","MED","HIGH","HIGH","HIGH","MED"],
    "Cotton":    ["MED","MED","MED","HIGH","HIGH","HIGH","MED","MED","LOW","LOW","MED","MED"],
    "Sugarcane": ["MED","MED","MED","MED","MED","MED","MED","MED","HIGH","HIGH","HIGH","MED"],
    "Potato":    ["HIGH","HIGH","MED","LOW","LOW","MED","MED","HIGH","HIGH","HIGH","HIGH","HIGH"],
    "Onion":     ["HIGH","HIGH","MED","LOW","LOW","MED","MED","HIGH","HIGH","HIGH","HIGH","HIGH"],
    "Tomato":    ["MED","MED","LOW","LOW","MED","HIGH","HIGH","HIGH","MED","LOW","MED","MED"],
    "Cabbage":   ["HIGH","HIGH","MED","LOW","LOW","MED","MED","MED","HIGH","HIGH","HIGH","HIGH"],
    "Carrot":    ["HIGH","HIGH","MED","LOW","MED","MED","MED","MED","HIGH","HIGH","HIGH","HIGH"],
}

_DEMAND_LABEL = {"LOW": "LOW", "MED": "MEDIUM", "HIGH": "HIGH"}


def _risk_label(score: float) -> str:
    if score < 0.3:
        return "LOW"
    if score < 0.55:
        return "MEDIUM"
    if score < 0.75:
        return "HIGH"
    return "CRITICAL"


def analyse(crop: str, state: str = "", month: int = 0) -> dict:
    """
    Return risk & profitability analysis for a crop.

    Args:
        crop:  Canonical crop name (must be in SUPPORTED_CROPS).
        state: Indian state name (optional, for regional tweaks).
        month: 1-12 integer. Defaults to current month.

    Returns:
        dict with keys: risk_score, risk_level, demand_level,
                        profitability, explanation
    """
    if crop not in SUPPORTED_CROPS:
        return {
            "risk_score": 0.5,
            "risk_level": "MEDIUM",
            "demand_level": "MEDIUM",
            "profitability": 50.0,
            "explanation": "Limited data available for this crop.",
        }

    if not month:
        month = date.today().month

    base_risk = _BASE_RISK.get(crop, 0.4)
    season_mult = _SEASONALITY[crop][month - 1]

    # Off-season → higher risk (lower seasonality = harder to sell)
    risk_score = round(base_risk + (1.0 - season_mult) * 0.15, 3)
    risk_score = max(0.05, min(0.95, risk_score))

    demand_raw = _DEMAND_MAP[crop][month - 1]
    demand_level = _DEMAND_LABEL[demand_raw]

    base_prof = _BASE_PROFIT.get(crop, 60)
    # Adjust profitability by season and demand
    demand_mult = 1.0 if demand_raw == "LOW" else (1.10 if demand_raw == "MED" else 1.20)
    profitability = round(base_prof * season_mult * demand_mult * 0.85, 1)
    profitability = max(20.0, min(98.0, profitability))

    # Build explanation
    parts = []
    if demand_level == "HIGH":
        parts.append("strong market demand")
    elif demand_level == "LOW":
        parts.append("low market demand this month")
    if season_mult >= 1.1:
        parts.append("favourable season")
    elif season_mult <= 0.9:
        parts.append("off-season pricing")
    if state:
        parts.append(f"regional conditions in {state}")
    explanation = (", ".join(parts).capitalize() + ".") if parts else "General market conditions."

    return {
        "risk_score": risk_score,
        "risk_level": _risk_label(risk_score),
        "demand_level": demand_level,
        "profitability": profitability,
        "explanation": explanation,
    }