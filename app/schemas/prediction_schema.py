"""Prediction Pydantic schemas"""
from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class PricePoint(BaseModel):
    date: date
    price: float

class PredictedPricePoint(BaseModel):
    date: date
    price: float
    lower_bound: float
    upper_bound: float

class CropPricePredictionResponse(BaseModel):
    crop: str
    current_price: float
    trend_direction: str  # UP/DOWN/STABLE
    historical_prices: List[PricePoint]
    predicted_prices: List[PredictedPricePoint]

class SeasonalityPattern(BaseModel):
    month: str
    index: float  # 0.5 to 1.5 multiplier
    price_level: str  # LOW/MEDIUM/HIGH

class SeasonalityResponse(BaseModel):
    crop: str
    best_selling_months: List[str]
    worst_selling_months: List[str]
    patterns: List[SeasonalityPattern]
