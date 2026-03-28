"""
Agricultural Data API endpoints (mandi prices, weather, crop patterns)
"""
import random
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.data_schema import CropPattern, MandiPrice, WeatherForecastItem, WeatherResponse

router = APIRouter()

_MANDI_MARKETS: List[str] = [
    "Azadpur (Delhi)", "Nasik (Maharashtra)", "Kolar (Karnataka)",
    "Agra (UP)", "Ludhiana (Punjab)", "Ahmedabad (Gujarat)",
    "Hyderabad (Telangana)", "Kolkata (WB)", "Indore (MP)", "Jaipur (Rajasthan)",
]

_BASE_PRICES_QUINTAL: dict = {
    "Rice": 2100, "Wheat": 2300, "Maize": 1500, "Cotton": 5500,
    "Sugarcane": 350, "Potato": 800, "Onion": 1500, "Tomato": 1800,
    "Cabbage": 700, "Carrot": 1000,
}

_REGIONAL_PATTERNS: List[CropPattern] = [
    CropPattern(region="Punjab", dominant_crops=["Wheat", "Rice", "Cotton"],
                season="Rabi/Kharif", area_ha=7500000),
    CropPattern(region="Haryana", dominant_crops=["Wheat", "Rice", "Sugarcane"],
                season="Rabi/Kharif", area_ha=3600000),
    CropPattern(region="Uttar Pradesh", dominant_crops=["Sugarcane", "Wheat", "Rice", "Potato"],
                season="Rabi/Kharif", area_ha=17000000),
    CropPattern(region="Maharashtra", dominant_crops=["Cotton", "Sugarcane", "Onion", "Soybean"],
                season="Kharif", area_ha=14500000),
    CropPattern(region="Karnataka", dominant_crops=["Rice", "Maize", "Cotton", "Tomato"],
                season="Kharif/Rabi", area_ha=8200000),
    CropPattern(region="Andhra Pradesh", dominant_crops=["Rice", "Cotton", "Groundnut"],
                season="Kharif", area_ha=6800000),
    CropPattern(region="West Bengal", dominant_crops=["Rice", "Potato", "Tomato", "Cabbage"],
                season="Kharif/Rabi", area_ha=5900000),
    CropPattern(region="Bihar", dominant_crops=["Rice", "Wheat", "Maize", "Potato"],
                season="Rabi/Kharif", area_ha=7200000),
    CropPattern(region="Gujarat", dominant_crops=["Cotton", "Wheat", "Groundnut", "Potato"],
                season="Kharif/Rabi", area_ha=8000000),
    CropPattern(region="Madhya Pradesh", dominant_crops=["Wheat", "Soybean", "Rice", "Maize"],
                season="Rabi/Kharif", area_ha=15000000),
]


def _gen_mandi_prices(crop: Optional[str], days: int) -> List[MandiPrice]:
    rng = random.Random(42)
    today = date.today()
    records: List[MandiPrice] = []
    crops = [crop] if crop else SUPPORTED_CROPS
    for c in crops:
        base = _BASE_PRICES_QUINTAL[c]
        for i in range(days):
            d = today - timedelta(days=i)
            market = rng.choice(_MANDI_MARKETS)
            noise = rng.uniform(-0.08, 0.12)
            modal = round(base * (1 + noise), 0)
            low = round(modal * rng.uniform(0.85, 0.95), 0)
            high = round(modal * rng.uniform(1.05, 1.20), 0)
            records.append(MandiPrice(
                date=d.isoformat(), crop=c, market=market,
                price_per_quintal=modal, min_price=low, max_price=high,
            ))
    return records


@router.get("/mandi-prices", response_model=List[MandiPrice])
def get_mandi_prices(
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    days: int = Query(7, ge=1, le=90, description="Number of past days to retrieve"),
) -> List[MandiPrice]:
    """Return historical mandi (APMC market) prices for crops with min/max ranges."""
    if crop:
        matched = None
        for c in SUPPORTED_CROPS:
            if c.lower() == crop.lower():
                matched = c
                break
        if not matched:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Crop '{crop}' not supported.")
        return _gen_mandi_prices(matched, days)
    return _gen_mandi_prices(None, days)


@router.get("/weather", response_model=WeatherResponse)
def get_weather(
    location: str = Query("Nashik", description="Location or state name"),
) -> WeatherResponse:
    """Return current weather conditions and 5-day forecast for a location."""
    rng = random.Random(hash(location.lower()) % (2**32))
    conditions = ["Sunny", "Partly Cloudy", "Overcast", "Light Rain", "Heavy Rain", "Thunderstorm"]
    forecast: List[WeatherForecastItem] = []
    today = date.today()
    for i in range(1, 6):
        d = today + timedelta(days=i)
        forecast.append(WeatherForecastItem(
            date=d.isoformat(),
            condition=rng.choice(conditions),
            max_temp=round(rng.uniform(28, 42), 1),
            min_temp=round(rng.uniform(18, 27), 1),
            rainfall_mm=round(rng.uniform(0, 25), 1),
        ))
    return WeatherResponse(
        location=location,
        temperature=round(rng.uniform(28, 38), 1),
        humidity=round(rng.uniform(40, 85), 1),
        rainfall_mm=round(rng.uniform(0, 15), 1),
        wind_speed=round(rng.uniform(5, 30), 1),
        forecast=forecast,
    )


@router.get("/crop-patterns", response_model=List[CropPattern])
def get_crop_patterns(
    region: Optional[str] = Query(None, description="Filter by region/state name"),
) -> List[CropPattern]:
    """Return regional crop cultivation patterns across Indian states."""
    if region:
        filtered = [p for p in _REGIONAL_PATTERNS if p.region.lower() == region.lower()]
        return filtered if filtered else _REGIONAL_PATTERNS
    return _REGIONAL_PATTERNS
