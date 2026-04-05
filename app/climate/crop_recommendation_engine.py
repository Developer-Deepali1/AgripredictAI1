"""
crop_recommendation_engine.py
==============================
Matches predicted future climate conditions with a built-in crop suitability
dataset and ranks crops by their climate resilience score.

The recommendation engine considers:
  1. Temperature tolerance (optimal range, heat / cold stress thresholds)
  2. Water requirement vs. predicted annual rainfall
  3. Humidity preference
  4. Soil pH suitability
  5. Nutrient requirements vs. available N / P / K

Each factor contributes a sub-score (0–1). The final resilience score is a
weighted mean of all sub-scores.

Public API
----------
    recommend_crops(bundle, prediction, top_n=5)
        -> RecommendationResult
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Crop suitability database
# ---------------------------------------------------------------------------
# Each entry defines:
#   temp_opt_min/max   : optimal temperature range (°C)
#   temp_stress_min/max: damage / failure threshold
#   rain_min/max       : annual rainfall requirement (mm)
#   humidity_min/max   : relative humidity preference (%)
#   ph_min/max         : soil pH tolerance
#   nitrogen_need      : relative N demand (0=low, 1=medium, 2=high)
#   planting_season    : typical sowing window (informational)
#   drought_tolerant   : bool – explicitly drought-hardy
#   heat_tolerant      : bool – explicitly heat-hardy

CROP_SUITABILITY: Dict[str, dict] = {
    "Millet": {
        "temp_opt_min": 25, "temp_opt_max": 35,
        "temp_stress_min": 10, "temp_stress_max": 42,
        "rain_min": 250, "rain_max": 700,
        "humidity_min": 30, "humidity_max": 75,
        "ph_min": 5.5, "ph_max": 8.0,
        "nitrogen_need": 0,
        "planting_season": "June–July",
        "drought_tolerant": True,
        "heat_tolerant": True,
    },
    "Sorghum": {
        "temp_opt_min": 25, "temp_opt_max": 35,
        "temp_stress_min": 10, "temp_stress_max": 40,
        "rain_min": 300, "rain_max": 750,
        "humidity_min": 30, "humidity_max": 80,
        "ph_min": 5.5, "ph_max": 8.5,
        "nitrogen_need": 1,
        "planting_season": "July–August",
        "drought_tolerant": True,
        "heat_tolerant": True,
    },
    "Pigeon Pea": {
        "temp_opt_min": 20, "temp_opt_max": 35,
        "temp_stress_min": 10, "temp_stress_max": 40,
        "rain_min": 400, "rain_max": 1000,
        "humidity_min": 40, "humidity_max": 80,
        "ph_min": 5.0, "ph_max": 7.5,
        "nitrogen_need": 0,
        "planting_season": "May–June",
        "drought_tolerant": True,
        "heat_tolerant": True,
    },
    "Groundnut": {
        "temp_opt_min": 24, "temp_opt_max": 33,
        "temp_stress_min": 15, "temp_stress_max": 40,
        "rain_min": 450, "rain_max": 1250,
        "humidity_min": 40, "humidity_max": 75,
        "ph_min": 5.9, "ph_max": 7.0,
        "nitrogen_need": 0,
        "planting_season": "June–July",
        "drought_tolerant": True,
        "heat_tolerant": False,
    },
    "Cotton": {
        "temp_opt_min": 21, "temp_opt_max": 35,
        "temp_stress_min": 15, "temp_stress_max": 43,
        "rain_min": 500, "rain_max": 1200,
        "humidity_min": 40, "humidity_max": 80,
        "ph_min": 5.8, "ph_max": 8.0,
        "nitrogen_need": 2,
        "planting_season": "May–June",
        "drought_tolerant": False,
        "heat_tolerant": True,
    },
    "Maize": {
        "temp_opt_min": 18, "temp_opt_max": 32,
        "temp_stress_min": 10, "temp_stress_max": 40,
        "rain_min": 500, "rain_max": 1200,
        "humidity_min": 45, "humidity_max": 85,
        "ph_min": 5.5, "ph_max": 7.5,
        "nitrogen_need": 2,
        "planting_season": "June–July",
        "drought_tolerant": False,
        "heat_tolerant": False,
    },
    "Rice": {
        "temp_opt_min": 20, "temp_opt_max": 35,
        "temp_stress_min": 10, "temp_stress_max": 40,
        "rain_min": 1000, "rain_max": 2000,
        "humidity_min": 60, "humidity_max": 95,
        "ph_min": 5.5, "ph_max": 7.5,
        "nitrogen_need": 2,
        "planting_season": "June–August",
        "drought_tolerant": False,
        "heat_tolerant": False,
    },
    "Wheat": {
        "temp_opt_min": 12, "temp_opt_max": 25,
        "temp_stress_min": 0, "temp_stress_max": 35,
        "rain_min": 450, "rain_max": 900,
        "humidity_min": 40, "humidity_max": 70,
        "ph_min": 6.0, "ph_max": 7.5,
        "nitrogen_need": 2,
        "planting_season": "October–November",
        "drought_tolerant": False,
        "heat_tolerant": False,
    },
    "Chickpea": {
        "temp_opt_min": 15, "temp_opt_max": 30,
        "temp_stress_min": 5, "temp_stress_max": 38,
        "rain_min": 300, "rain_max": 650,
        "humidity_min": 30, "humidity_max": 60,
        "ph_min": 5.5, "ph_max": 8.0,
        "nitrogen_need": 0,
        "planting_season": "October–November",
        "drought_tolerant": True,
        "heat_tolerant": False,
    },
    "Lentil": {
        "temp_opt_min": 10, "temp_opt_max": 25,
        "temp_stress_min": 0, "temp_stress_max": 32,
        "rain_min": 250, "rain_max": 500,
        "humidity_min": 30, "humidity_max": 65,
        "ph_min": 6.0, "ph_max": 8.0,
        "nitrogen_need": 0,
        "planting_season": "November–December",
        "drought_tolerant": True,
        "heat_tolerant": False,
    },
}

# ---------------------------------------------------------------------------
# Scoring weights
# ---------------------------------------------------------------------------
_WEIGHTS = {
    "temperature": 0.30,
    "rainfall":    0.25,
    "humidity":    0.15,
    "soil_ph":     0.15,
    "nutrients":   0.15,
}


# ---------------------------------------------------------------------------
# Sub-score helpers
# ---------------------------------------------------------------------------

def _score_in_range(value: float, opt_min: float, opt_max: float,
                    stress_min: float, stress_max: float) -> float:
    """Return 0–1 score based on how well *value* fits within the optimal range."""
    if stress_max > stress_min and (value < stress_min or value > stress_max):
        return 0.0
    if opt_min <= value <= opt_max:
        return 1.0
    if value < opt_min:
        gap = opt_min - value
        tolerance = opt_min - stress_min
        return max(0.0, 1.0 - gap / max(1.0, tolerance))
    # value > opt_max
    gap = value - opt_max
    tolerance = stress_max - opt_max
    return max(0.0, 1.0 - gap / max(1.0, tolerance))


def _score_rainfall(predicted_rain: float, rain_min: float, rain_max: float,
                    drought_tolerant: bool) -> float:
    """Score rainfall fit; drought-tolerant crops get a bonus under low rainfall."""
    base = _score_in_range(predicted_rain, rain_min, rain_max,
                            rain_min * 0.5, rain_max * 1.5)
    if drought_tolerant and predicted_rain < rain_min:
        base = min(1.0, base + 0.10)
    return base


def _score_ph(soil_ph: float, ph_min: float, ph_max: float) -> float:
    return _score_in_range(soil_ph, ph_min, ph_max, ph_min - 1.0, ph_max + 1.0)


def _score_nutrients(nitrogen: float, phosphorus: float, potassium: float,
                     nitrogen_need: int) -> float:
    """
    Simple nutrient availability score.
    nitrogen_need: 0=low, 1=medium, 2=high
    """
    # Minimum NPK thresholds by need level
    n_thresh  = [20, 50, 80][nitrogen_need]
    p_thresh  = 20.0
    k_thresh  = 30.0

    n_score = min(1.0, nitrogen  / n_thresh)
    p_score = min(1.0, phosphorus / p_thresh)
    k_score = min(1.0, potassium / k_thresh)
    return (n_score + p_score + k_score) / 3.0


def _resilience_score(
    crop: str,
    info: dict,
    pred_temp: float,
    pred_rain: float,
    pred_hum: float,
    soil_ph: float,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
) -> float:
    """Compute weighted climate resilience score (0–1) for a single crop."""
    s_temp = _score_in_range(pred_temp,
                              info["temp_opt_min"], info["temp_opt_max"],
                              info["temp_stress_min"], info["temp_stress_max"])
    s_rain = _score_rainfall(pred_rain, info["rain_min"], info["rain_max"],
                              info["drought_tolerant"])
    s_hum  = _score_in_range(pred_hum,
                              info["humidity_min"], info["humidity_max"],
                              max(0, info["humidity_min"] - 15),
                              min(100, info["humidity_max"] + 15))
    s_ph   = _score_ph(soil_ph, info["ph_min"], info["ph_max"])
    s_nut  = _score_nutrients(nitrogen, phosphorus, potassium, info["nitrogen_need"])

    score = (
        _WEIGHTS["temperature"] * s_temp
        + _WEIGHTS["rainfall"]  * s_rain
        + _WEIGHTS["humidity"]  * s_hum
        + _WEIGHTS["soil_ph"]   * s_ph
        + _WEIGHTS["nutrients"] * s_nut
    )
    return round(score, 4)


# ---------------------------------------------------------------------------
# Explanation generator
# ---------------------------------------------------------------------------

def _generate_explanation(
    top_crops: List["CropRecommendation"],  # noqa: F821
    temp_change: float,
    rain_variation: float,
    climate_zone: str,
) -> str:
    """Return a human-readable explanation for the recommendations."""
    parts: List[str] = []

    if temp_change > 0.5:
        parts.append(
            f"temperatures are projected to rise by {temp_change:+.1f} °C"
        )
    elif temp_change < -0.5:
        parts.append(
            f"temperatures are projected to fall by {abs(temp_change):.1f} °C"
        )

    if rain_variation < -5:
        parts.append(
            f"annual rainfall is expected to decrease by {abs(rain_variation):.0f}%"
        )
    elif rain_variation > 5:
        parts.append(
            f"annual rainfall is expected to increase by {rain_variation:.0f}%"
        )

    crop_names = ", ".join(c.crop for c in top_crops[:3])
    climate_str = f" in the {climate_zone} zone" if climate_zone else ""

    if parts:
        conditions = " and ".join(parts)
        return (
            f"These crops are recommended because {conditions}{climate_str}. "
            f"{crop_names} have strong climate resilience and will remain "
            f"productive under the projected future conditions."
        )
    return (
        f"{crop_names} are well-suited to the stable climate conditions "
        f"projected for this region{climate_str}."
    )


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class CropRecommendation:
    """A single crop recommendation with its resilience score and planting season."""
    crop: str
    resilience_score: float
    planting_season: str


@dataclass
class RecommendationResult:
    """Full output of the recommendation engine."""
    recommended_crops: List[CropRecommendation]
    explanation: str


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def recommend_crops(
    bundle: "ClimateDataBundle",       # noqa: F821
    prediction: "ClimatePrediction",   # noqa: F821
    top_n: int = 5,
) -> RecommendationResult:
    """Recommend climate-resilient crops for the given location and predictions.

    Uses the *mid-point* future year's predicted climate (≈ year 5 of the
    forecast) as the representative future condition.

    Args:
        bundle:     Climate data bundle (includes soil parameters).
        prediction: Output from :func:`predict_future_climate`.
        top_n:      Number of top crops to return.

    Returns:
        A :class:`RecommendationResult` with ranked crops and an explanation.
    """
    # Use mid-point prediction year as representative future climate
    mid_idx = len(prediction.predicted_years) // 2
    mid_pred = prediction.predicted_years[mid_idx]

    pred_temp = mid_pred.avg_temperature
    pred_rain = mid_pred.total_rainfall
    pred_hum  = mid_pred.avg_humidity
    soil      = bundle.soil

    scores: List[Tuple[float, str]] = []
    for crop_name, info in CROP_SUITABILITY.items():
        score = _resilience_score(
            crop_name, info,
            pred_temp, pred_rain, pred_hum,
            soil.ph, soil.nitrogen, soil.phosphorus, soil.potassium,
        )
        scores.append((score, crop_name))

    scores.sort(key=lambda x: x[0], reverse=True)
    top = scores[:top_n]

    recommendations = [
        CropRecommendation(
            crop=crop_name,
            resilience_score=score,
            planting_season=CROP_SUITABILITY[crop_name]["planting_season"],
        )
        for score, crop_name in top
    ]

    explanation = _generate_explanation(
        recommendations,
        prediction.temperature_change,
        prediction.rainfall_variation,
        bundle.climate_zone,
    )

    logger.info(
        "Top %d crops recommended for the requested location: %s",
        top_n,
        [r.crop for r in recommendations],
    )

    return RecommendationResult(
        recommended_crops=recommendations,
        explanation=explanation,
    )
