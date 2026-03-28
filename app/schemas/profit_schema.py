"""Profit Pydantic schemas"""
from pydantic import BaseModel
from typing import Optional, Dict, List

class ProfitCalculateRequest(BaseModel):
    crop: str
    area_ha: float
    season: Optional[str] = None

class CostBreakdown(BaseModel):
    seeds: float
    fertilizer: float
    labor: float
    irrigation: float
    other: float

class ProfitCalculateResponse(BaseModel):
    crop: str
    area_ha: float
    expected_yield_kg_ha: float
    predicted_price_per_kg: float
    total_revenue: float
    estimated_cost: float
    net_profit: float
    profit_per_ha: float
    cost_breakdown: CostBreakdown
    roi_percent: float

class CropProfitComparison(BaseModel):
    crop: str
    profit_per_ha: float
    revenue_per_ha: float
    cost_per_ha: float
    roi_percent: float

class ProfitComparisonResponse(BaseModel):
    season: str
    crops: List[CropProfitComparison]
