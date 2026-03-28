"""
Crop Feasibility Analysis API endpoints
"""
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.feasibility_schema import (
    CropFeasibility,
    CropFeasibilityInfo,
    FeasibilityCheckRequest,
    FeasibilityCheckResponse,
)

router = APIRouter()

_SOIL_CROP_SCORES: dict = {
    "Alluvial":  {"Rice": 0.92, "Wheat": 0.88, "Maize": 0.80, "Cotton": 0.70, "Sugarcane": 0.85,
                  "Potato": 0.78, "Onion": 0.75, "Tomato": 0.80, "Cabbage": 0.72, "Carrot": 0.70},
    "Black":     {"Rice": 0.60, "Wheat": 0.75, "Maize": 0.65, "Cotton": 0.95, "Sugarcane": 0.80,
                  "Potato": 0.55, "Onion": 0.70, "Tomato": 0.65, "Cabbage": 0.60, "Carrot": 0.55},
    "Red":       {"Rice": 0.70, "Wheat": 0.65, "Maize": 0.75, "Cotton": 0.72, "Sugarcane": 0.68,
                  "Potato": 0.65, "Onion": 0.68, "Tomato": 0.72, "Cabbage": 0.68, "Carrot": 0.65},
    "Laterite":  {"Rice": 0.65, "Wheat": 0.50, "Maize": 0.70, "Cotton": 0.55, "Sugarcane": 0.60,
                  "Potato": 0.58, "Onion": 0.55, "Tomato": 0.65, "Cabbage": 0.60, "Carrot": 0.58},
    "Sandy":     {"Rice": 0.45, "Wheat": 0.50, "Maize": 0.55, "Cotton": 0.60, "Sugarcane": 0.48,
                  "Potato": 0.72, "Onion": 0.65, "Tomato": 0.60, "Cabbage": 0.55, "Carrot": 0.75},
    "Loamy":     {"Rice": 0.82, "Wheat": 0.85, "Maize": 0.88, "Cotton": 0.78, "Sugarcane": 0.82,
                  "Potato": 0.90, "Onion": 0.85, "Tomato": 0.88, "Cabbage": 0.85, "Carrot": 0.88},
    "Clay":      {"Rice": 0.88, "Wheat": 0.72, "Maize": 0.68, "Cotton": 0.75, "Sugarcane": 0.80,
                  "Potato": 0.60, "Onion": 0.65, "Tomato": 0.62, "Cabbage": 0.68, "Carrot": 0.58},
}

_SEASON_CROP_SCORES: dict = {
    "Kharif":  {"Rice": 0.95, "Wheat": 0.30, "Maize": 0.85, "Cotton": 0.90, "Sugarcane": 0.80,
                "Potato": 0.40, "Onion": 0.55, "Tomato": 0.70, "Cabbage": 0.50, "Carrot": 0.45},
    "Rabi":    {"Rice": 0.35, "Wheat": 0.95, "Maize": 0.65, "Cotton": 0.25, "Sugarcane": 0.70,
                "Potato": 0.90, "Onion": 0.85, "Tomato": 0.80, "Cabbage": 0.88, "Carrot": 0.88},
    "Zaid":    {"Rice": 0.55, "Wheat": 0.30, "Maize": 0.75, "Cotton": 0.60, "Sugarcane": 0.85,
                "Potato": 0.65, "Onion": 0.70, "Tomato": 0.85, "Cabbage": 0.65, "Carrot": 0.60},
}

_STATE_CROP_SCORES: dict = {
    "Punjab":        {"Rice": 0.90, "Wheat": 0.95, "Cotton": 0.80},
    "Haryana":       {"Rice": 0.85, "Wheat": 0.92, "Cotton": 0.75},
    "Maharashtra":   {"Cotton": 0.92, "Sugarcane": 0.90, "Onion": 0.88},
    "Uttar Pradesh": {"Rice": 0.88, "Wheat": 0.90, "Sugarcane": 0.92, "Potato": 0.85},
    "Karnataka":     {"Rice": 0.80, "Maize": 0.85, "Cotton": 0.78, "Tomato": 0.82},
    "Andhra Pradesh": {"Rice": 0.90, "Cotton": 0.85, "Chilli": 0.88},
    "West Bengal":   {"Rice": 0.93, "Potato": 0.88, "Tomato": 0.80},
    "Bihar":         {"Rice": 0.85, "Wheat": 0.88, "Maize": 0.82, "Potato": 0.80},
    "Gujarat":       {"Cotton": 0.90, "Wheat": 0.80, "Sugarcane": 0.78, "Potato": 0.75},
    "Madhya Pradesh": {"Wheat": 0.88, "Rice": 0.75, "Soybean": 0.90, "Maize": 0.78},
}

_CROP_INFO: dict = {
    "Rice":      {"best_seasons": ["Kharif"], "suitable_soils": ["Alluvial", "Clay", "Loamy"],
                  "water_requirement": "High", "typical_yield_kg_ha": 3500.0},
    "Wheat":     {"best_seasons": ["Rabi"], "suitable_soils": ["Alluvial", "Loamy", "Black"],
                  "water_requirement": "Medium", "typical_yield_kg_ha": 3200.0},
    "Maize":     {"best_seasons": ["Kharif", "Zaid"], "suitable_soils": ["Loamy", "Red", "Sandy"],
                  "water_requirement": "Medium", "typical_yield_kg_ha": 2800.0},
    "Cotton":    {"best_seasons": ["Kharif"], "suitable_soils": ["Black", "Alluvial", "Loamy"],
                  "water_requirement": "Medium", "typical_yield_kg_ha": 1800.0},
    "Sugarcane": {"best_seasons": ["Kharif", "Zaid"], "suitable_soils": ["Alluvial", "Loamy", "Clay"],
                  "water_requirement": "Very High", "typical_yield_kg_ha": 70000.0},
    "Potato":    {"best_seasons": ["Rabi"], "suitable_soils": ["Loamy", "Sandy", "Alluvial"],
                  "water_requirement": "Medium", "typical_yield_kg_ha": 22000.0},
    "Onion":     {"best_seasons": ["Rabi", "Kharif"], "suitable_soils": ["Loamy", "Alluvial", "Black"],
                  "water_requirement": "Low", "typical_yield_kg_ha": 16000.0},
    "Tomato":    {"best_seasons": ["Rabi", "Zaid"], "suitable_soils": ["Loamy", "Red", "Alluvial"],
                  "water_requirement": "Medium", "typical_yield_kg_ha": 25000.0},
    "Cabbage":   {"best_seasons": ["Rabi"], "suitable_soils": ["Loamy", "Alluvial", "Clay"],
                  "water_requirement": "Medium", "typical_yield_kg_ha": 30000.0},
    "Carrot":    {"best_seasons": ["Rabi"], "suitable_soils": ["Sandy", "Loamy", "Red"],
                  "water_requirement": "Low", "typical_yield_kg_ha": 20000.0},
}

_FEASIBILITY_FACTORS: dict = {
    "Rice":      ["Requires flooded paddies", "Best in alluvial river plains", "Kharif season crop"],
    "Wheat":     ["Cool, dry winters essential", "Well-drained loamy soil preferred", "Rabi season crop"],
    "Maize":     ["Warm climate preferred", "Moderate rainfall sufficient", "Versatile soil adaptability"],
    "Cotton":    ["Deep black soil ideal", "Warm & dry climate required", "Major cash crop"],
    "Sugarcane": ["High water requirement", "Tropical climate needed", "18-month crop cycle"],
    "Potato":    ["Cool winters essential", "Well-drained sandy loam preferred", "High market demand"],
    "Onion":     ["Moderate moisture needed", "Well-drained alluvial soil", "Price-volatile crop"],
    "Tomato":    ["Warm days, cool nights ideal", "Supports greenhouse cultivation", "High-value vegetable"],
    "Cabbage":   ["Cool climate required", "Rich well-drained soil", "Short growing cycle"],
    "Carrot":    ["Deep well-drained sandy soil", "Cool climate for root development", "High nutrition value"],
}


def _feasibility_status(score: float) -> str:
    if score >= 0.7:
        return "Suitable"
    if score >= 0.45:
        return "Marginal"
    return "Not Suitable"


@router.post("/check", response_model=FeasibilityCheckResponse)
def check_feasibility(payload: FeasibilityCheckRequest) -> FeasibilityCheckResponse:
    """Check crop feasibility for a given location, soil type, and season."""
    soil = payload.soil_type.title()
    season = payload.season.title()
    location = payload.location.title()

    soil_scores = _SOIL_CROP_SCORES.get(soil, _SOIL_CROP_SCORES["Loamy"])
    season_scores = _SEASON_CROP_SCORES.get(season, _SEASON_CROP_SCORES["Kharif"])
    state_scores = _STATE_CROP_SCORES.get(location, {})

    crops: List[CropFeasibility] = []
    for crop in SUPPORTED_CROPS:
        soil_s = soil_scores.get(crop, 0.6)
        season_s = season_scores.get(crop, 0.6)
        state_s = state_scores.get(crop, 0.7)
        combined = round((soil_s * 0.35 + season_s * 0.40 + state_s * 0.25), 3)
        combined = min(combined, 1.0)
        factors = _FEASIBILITY_FACTORS.get(crop, [])
        crops.append(CropFeasibility(
            crop=crop,
            feasibility_score=combined,
            status=_feasibility_status(combined),
            factors=factors,
        ))

    crops.sort(key=lambda c: c.feasibility_score, reverse=True)
    return FeasibilityCheckResponse(
        location=payload.location,
        soil_type=payload.soil_type,
        season=payload.season,
        crops=crops,
    )


@router.get("/crops", response_model=List[CropFeasibilityInfo])
def get_crop_feasibility_info() -> List[CropFeasibilityInfo]:
    """Return general feasibility information for all supported crops."""
    return [
        CropFeasibilityInfo(
            crop=crop,
            best_seasons=info["best_seasons"],
            suitable_soils=info["suitable_soils"],
            water_requirement=info["water_requirement"],
            typical_yield_kg_ha=info["typical_yield_kg_ha"],
        )
        for crop, info in _CROP_INFO.items()
    ]
