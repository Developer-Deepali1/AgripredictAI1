"""
climate_api.py
==============
FastAPI router for the Climate-Resilient Crop Recommendation Engine.

Endpoints
---------
POST /predict/future-crops
    Accept a farmer's location and soil parameters, run the climate prediction
    and crop recommendation pipeline, and return the top-5 climate-resilient
    crops together with a future climate summary and explanation.

GET /predict/future-crops/crops
    Return the list of crops included in the recommendation database.
"""

from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.climate.climate_data_loader import load_climate_data
from app.climate.climate_prediction_model import predict_future_climate
from app.climate.crop_recommendation_engine import (
    CROP_SUITABILITY,
    recommend_crops,
)

router = APIRouter()
logger = logging.getLogger("climate_api")


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class FutureCropRequest(BaseModel):
    """Input payload for the future-crop recommendation endpoint."""

    latitude: float = Field(
        ..., ge=-90, le=90,
        description="Farm latitude in decimal degrees.",
        examples=[20.2961],
    )
    longitude: float = Field(
        ..., ge=-180, le=180,
        description="Farm longitude in decimal degrees.",
        examples=[85.8245],
    )
    soil_ph: float = Field(
        default=6.5, ge=0, le=14,
        description="Soil pH (0–14).",
        examples=[6.5],
    )
    nitrogen: float = Field(
        default=80.0, ge=0,
        description="Available nitrogen in kg/ha.",
        examples=[80],
    )
    phosphorus: float = Field(
        default=45.0, ge=0,
        description="Available phosphorus in kg/ha.",
        examples=[45],
    )
    potassium: float = Field(
        default=50.0, ge=0,
        description="Available potassium in kg/ha.",
        examples=[50],
    )
    horizon_years: int = Field(
        default=7, ge=1, le=10,
        description="Number of years ahead to forecast (1–10).",
    )


class CropItem(BaseModel):
    """A single crop recommendation with resilience score and planting season."""

    crop: str
    resilience_score: float = Field(
        ..., ge=0, le=1,
        description="Climate resilience score (0–1; higher is better).",
    )
    planting_season: str


class FutureClimateSummary(BaseModel):
    """Aggregate climate change summary over the forecast horizon."""

    temperature_change: str = Field(
        ...,
        description="Projected temperature change (e.g. '+1.8°C').",
    )
    rainfall_variation: str = Field(
        ...,
        description="Projected rainfall change (e.g. '-10%').",
    )
    humidity_change: str = Field(
        ...,
        description="Projected humidity change (e.g. '-5%').",
    )
    climate_zone: str = Field(
        ...,
        description="Köppen climate classification of the location.",
    )


class TemperatureTrend(BaseModel):
    """Predicted temperature value for a single future year."""

    year: int
    temperature: float


class RainfallTrend(BaseModel):
    """Predicted rainfall value for a single future year."""

    year: int
    rainfall: float


class FutureCropResponse(BaseModel):
    """Full response payload from POST /predict/future-crops."""

    recommended_crops: List[CropItem]
    future_climate_summary: FutureClimateSummary
    explanation: str
    confidence_score: float = Field(
        ..., ge=0, le=1,
        description="Model confidence in the climate prediction (0–1).",
    )
    model_type: str = Field(
        ...,
        description="ML model used for climate prediction.",
    )
    temperature_trend: List[TemperatureTrend] = Field(
        default_factory=list,
        description="Yearly predicted temperature for charting.",
    )
    rainfall_trend: List[RainfallTrend] = Field(
        default_factory=list,
        description="Yearly predicted rainfall for charting.",
    )


# ---------------------------------------------------------------------------
# Endpoint implementations
# ---------------------------------------------------------------------------

@router.post(
    "/future-crops",
    response_model=FutureCropResponse,
    summary="Predict climate-resilient crops",
    description=(
        "Given a farm location and current soil parameters, forecast future climate "
        "conditions and return the top-5 climate-resilient crops ranked by resilience score."
    ),
)
def predict_future_crops(payload: FutureCropRequest) -> FutureCropResponse:
    """Climate-resilient crop recommendation endpoint.

    Steps:
      1. Load historical climate data for the location.
      2. Train an ML model and predict climate for the next *horizon_years*.
      3. Rank crops by climate resilience score.
      4. Return recommendations + climate summary + chart data.
    """
    logger.info(
        "Future-crop prediction requested | horizon=%d",
        payload.horizon_years,
    )

    # ── Step 1: Load climate data ─────────────────────────────────────────
    try:
        bundle = load_climate_data(
            latitude=payload.latitude,
            longitude=payload.longitude,
            soil_ph=payload.soil_ph,
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
        )
    except Exception as exc:
        logger.exception("Failed to load climate data: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load climate data for the given location.",
        ) from exc

    # ── Step 2: Predict future climate ───────────────────────────────────
    try:
        prediction = predict_future_climate(bundle, horizon_years=payload.horizon_years)
    except Exception as exc:
        logger.exception("Failed to predict future climate: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate climate predictions.",
        ) from exc

    # ── Step 3: Recommend crops ───────────────────────────────────────────
    try:
        result = recommend_crops(bundle, prediction)
    except Exception as exc:
        logger.exception("Failed to recommend crops: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate crop recommendations.",
        ) from exc

    # ── Step 4: Format response ───────────────────────────────────────────
    recommended_crops = [
        CropItem(
            crop=r.crop,
            resilience_score=r.resilience_score,
            planting_season=r.planting_season,
        )
        for r in result.recommended_crops
    ]

    temp_change_val = prediction.temperature_change
    rain_change_val = prediction.rainfall_variation
    hum_change_val  = prediction.humidity_change

    temp_str = f"{temp_change_val:+.1f}°C"
    rain_str = f"{rain_change_val:+.0f}%"
    hum_str  = f"{hum_change_val:+.1f}%"

    climate_summary = FutureClimateSummary(
        temperature_change=temp_str,
        rainfall_variation=rain_str,
        humidity_change=hum_str,
        climate_zone=bundle.climate_zone,
    )

    temperature_trend = [
        TemperatureTrend(year=y.year, temperature=y.avg_temperature)
        for y in prediction.predicted_years
    ]
    rainfall_trend = [
        RainfallTrend(year=y.year, rainfall=y.total_rainfall)
        for y in prediction.predicted_years
    ]

    return FutureCropResponse(
        recommended_crops=recommended_crops,
        future_climate_summary=climate_summary,
        explanation=result.explanation,
        confidence_score=prediction.confidence_score,
        model_type=prediction.model_type,
        temperature_trend=temperature_trend,
        rainfall_trend=rainfall_trend,
    )


@router.get(
    "/future-crops/crops",
    summary="List supported crops",
    description="Return the list of crops available in the recommendation database.",
)
def list_supported_crops() -> dict:
    """Return all crops in the suitability database."""
    return {
        "crops": sorted(CROP_SUITABILITY.keys()),
        "total": len(CROP_SUITABILITY),
    }
