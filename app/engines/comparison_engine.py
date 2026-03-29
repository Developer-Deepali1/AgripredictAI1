"""
Comparison Engine – runs "what-if" analysis for multiple crops.
"""
import logging
from datetime import date
from typing import List, Optional, Dict, Any

from app.core.constants import SUPPORTED_CROPS
from app.engines import risk_analyzer

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Base prices per kg (INR) – mirrors prediction_api.py
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

# Conversion factor: kg → quintal (100 kg)
_KG_TO_QTL = 100


def _price_per_qtl(crop: str, month: int) -> float:
    base = _BASE_PRICES.get(crop, 10.0)
    season = _SEASONALITY.get(crop, [1.0] * 12)[month - 1]
    return round(base * season * _KG_TO_QTL, 2)


def compare_crops(
    crops: List[str],
    state: Optional[str] = None,
    month: int = 0,
) -> List[Dict[str, Any]]:
    """
    Compare a list of crops and return per-crop analysis dicts,
    ranked by profitability (descending).

    Each dict contains:
      crop, predicted_price, demand_level, risk_level,
      profitability, is_recommended
    """
    if not month:
        month = date.today().month

    results = []
    for crop in crops:
        if crop not in SUPPORTED_CROPS:
            logger.warning("Unknown crop in comparison: %s", crop)
            continue
        price = _price_per_qtl(crop, month)
        analysis = risk_analyzer.analyse(crop, state or "", month)
        results.append({
            "crop": crop,
            "predicted_price": price,
            "demand_level": analysis["demand_level"],
            "risk_level": analysis["risk_level"],
            "profitability": analysis["profitability"],
            "is_recommended": False,
        })

    if not results:
        return []

    # Rank by profitability; mark best
    results.sort(key=lambda r: r["profitability"], reverse=True)
    results[0]["is_recommended"] = True
    return results


def recommend_best_crop(
    crops: List[str],
    state: Optional[str] = None,
    month: int = 0,
) -> Optional[str]:
    """Return the name of the most profitable crop from the list."""
    ranked = compare_crops(crops, state, month)
    return ranked[0]["crop"] if ranked else None
