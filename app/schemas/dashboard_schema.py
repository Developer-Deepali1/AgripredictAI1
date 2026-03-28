"""Dashboard Pydantic schemas"""
from pydantic import BaseModel
from typing import List

class PriceTrendItem(BaseModel):
    crop: str
    current_price: float
    change_pct: float

class DashboardSummaryResponse(BaseModel):
    total_crops: int
    active_alerts: int
    top_profit_crop: str
    risk_summary: str
    recent_alerts: List[dict]
    top_recommendations: List[str]
    price_trend_data: List[PriceTrendItem]
