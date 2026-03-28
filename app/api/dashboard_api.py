"""
Dashboard Summary API endpoints
"""
from typing import List

from fastapi import APIRouter

from app.schemas.dashboard_schema import DashboardSummaryResponse, PriceTrendItem

router = APIRouter()

_RECENT_ALERTS: List[dict] = [
    {"id": 1, "alert_type": "PRICE_DROP", "crop": "Tomato",
     "message": "Tomato prices down 18% at Nasik APMC.", "severity": "HIGH"},
    {"id": 2, "alert_type": "WEATHER_WARNING", "crop": None,
     "message": "Heavy rainfall alert for Vidarbha (48 hrs).", "severity": "HIGH"},
    {"id": 3, "alert_type": "PRICE_SPIKE", "crop": "Onion",
     "message": "Onion prices up 25% at Delhi Azadpur.", "severity": "MEDIUM"},
]

_PRICE_TRENDS: List[PriceTrendItem] = [
    PriceTrendItem(crop="Rice",      current_price=21.5,  change_pct=1.2),
    PriceTrendItem(crop="Wheat",     current_price=23.0,  change_pct=0.5),
    PriceTrendItem(crop="Tomato",    current_price=14.8,  change_pct=-18.2),
    PriceTrendItem(crop="Onion",     current_price=18.5,  change_pct=24.8),
    PriceTrendItem(crop="Potato",    current_price=7.2,   change_pct=-5.1),
    PriceTrendItem(crop="Cotton",    current_price=56.0,  change_pct=2.8),
    PriceTrendItem(crop="Sugarcane", current_price=3.6,   change_pct=0.3),
    PriceTrendItem(crop="Maize",     current_price=15.2,  change_pct=3.1),
]


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary() -> DashboardSummaryResponse:
    """Return aggregated dashboard summary including alerts, top crops, and price trends."""
    return DashboardSummaryResponse(
        total_crops=10,
        active_alerts=5,
        top_profit_crop="Tomato",
        risk_summary="3 HIGH alerts active. Onion and Tomato markets volatile this week.",
        recent_alerts=_RECENT_ALERTS,
        top_recommendations=["Tomato", "Potato", "Sugarcane"],
        price_trend_data=_PRICE_TRENDS,
    )
