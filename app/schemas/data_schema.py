"""Data Pydantic schemas"""
from pydantic import BaseModel
from typing import List

class MandiPrice(BaseModel):
    date: str
    crop: str
    market: str
    price_per_quintal: float
    min_price: float
    max_price: float

class WeatherForecastItem(BaseModel):
    date: str
    condition: str
    max_temp: float
    min_temp: float
    rainfall_mm: float

class WeatherResponse(BaseModel):
    location: str
    temperature: float
    humidity: float
    rainfall_mm: float
    wind_speed: float
    forecast: List[WeatherForecastItem]

class CropPattern(BaseModel):
    region: str
    dominant_crops: List[str]
    season: str
    area_ha: float
