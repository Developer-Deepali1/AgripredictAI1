"""
Market Price Prediction API endpoints
"""
import random
from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.prediction_schema import (
    CropPricePredictionResponse,
    PricePoint,
    PredictedPricePoint,
    SeasonalityResponse,
    SeasonalityPattern,
)

router = APIRouter()

# Base prices per kg (INR)
_BASE_PRICES: dict = {
    "Rice": 21.0, "Wheat": 23.0, "Maize": 15.0, "Cotton": 55.0,
    "Sugarcane": 3.5, "Potato": 8.0, "Onion": 15.0, "Tomato": 18.0,
    "Cabbage": 7.0, "Carrot": 10.0,
}

# Month-wise seasonality multipliers
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


def _normalize_crop(crop: str) -> str:
    """Return the canonical crop name or raise 404."""
    for c in SUPPORTED_CROPS:
        if c.lower() == crop.lower():
            return c
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Crop '{crop}' not supported. Supported: {SUPPORTED_CROPS}",
    )


@router.get("/prices/{crop}", response_model=CropPricePredictionResponse)
def get_price_prediction(crop: str) -> CropPricePredictionResponse:
    """Return historical and predicted prices with confidence intervals for a crop."""
    crop = _normalize_crop(crop)
    rng = random.Random(hash(crop) % (2**32))
    base = _BASE_PRICES[crop]
    today = date.today()

    historical: List[PricePoint] = []
    for i in range(12, 0, -1):
        d = today - timedelta(days=i * 30)
        noise = rng.uniform(-0.05, 0.05)
        season_mult = _SEASONALITY[crop][d.month - 1]
        price = round(base * season_mult * (1 + noise), 2)
        historical.append(PricePoint(date=d, price=price))

    current_price = round(base * _SEASONALITY[crop][today.month - 1], 2)

    predicted: List[PredictedPricePoint] = []
    for i in range(1, 7):
        d = today + timedelta(days=i * 30)
        noise = rng.uniform(-0.03, 0.08)
        season_mult = _SEASONALITY[crop][(d.month - 1) % 12]
        pred_price = round(base * season_mult * (1 + noise), 2)
        margin = round(pred_price * 0.08, 2)
        predicted.append(PredictedPricePoint(
            date=d,
            price=pred_price,
            lower_bound=round(pred_price - margin, 2),
            upper_bound=round(pred_price + margin, 2),
        ))

    last_hist = historical[-1].price
    next_pred = predicted[0].price
    if next_pred > last_hist * 1.02:
        trend = "UP"
    elif next_pred < last_hist * 0.98:
        trend = "DOWN"
    else:
        trend = "STABLE"

    return CropPricePredictionResponse(
        crop=crop,
        current_price=current_price,
        trend_direction=trend,
        historical_prices=historical,
        predicted_prices=predicted,
    )


@router.get("/seasonality/{crop}", response_model=SeasonalityResponse)
def get_seasonality(crop: str) -> SeasonalityResponse:
    """Return month-wise seasonality patterns for a crop."""
    crop = _normalize_crop(crop)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    multipliers = _SEASONALITY[crop]

    patterns: List[SeasonalityPattern] = []
    for i, mult in enumerate(multipliers):
        if mult >= 1.15:
            level = "HIGH"
        elif mult >= 0.95:
            level = "MEDIUM"
        else:
            level = "LOW"
        patterns.append(SeasonalityPattern(month=month_names[i], index=round(mult, 2), price_level=level))

    best = sorted(range(12), key=lambda i: multipliers[i], reverse=True)[:3]
    worst = sorted(range(12), key=lambda i: multipliers[i])[:3]

    return SeasonalityResponse(
        crop=crop,
        best_selling_months=[month_names[i] for i in best],
        worst_selling_months=[month_names[i] for i in worst],
        patterns=patterns,
    )
