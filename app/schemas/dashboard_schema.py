"""Dashboard Pydantic schemas"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummaryResponse(BaseModel):
    total_crops: int
    active_alerts: int
    profit_estimate: str
    risk_level: str
    top_profit_crop: str
    risk_summary: str
    recent_alerts: List[Dict[str, Any]]
    top_recommendations: List[Dict[str, Any]]
    price_trend_data: List[Dict[str, Any]]
