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

class CropRecommendationMLRequest(BaseModel):
    nitrogen: float  # N in kg/ha
    phosphorus: float  # P in kg/ha
    potassium: float  # K in kg/ha
    temperature: float  # in °C
    humidity: float  # in %
    ph: float  # soil pH (3.5 - 9.5)
    rainfall: float  # annual or seasonal rainfall in mm
    top_n: Optional[int] = 5

class RecommendedCropItem(BaseModel):
    rank: int
    crop: str
    probability: float
    confidence_score: float
    icon: str
    color: str
    season: str
    water_requirement: str
    estimated_profit: str
    description: str

class CropRecommendationMLResponse(BaseModel):
    model_type: str
    model_accuracy: float
    top_crop: Optional[str]
    inputs: dict
    recommendations: List[RecommendedCropItem]
