"""Pydantic schemas for Crop Rotation Planning & Soil Health Optimizer"""
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class SoilNutrients(BaseModel):
    nitrogen: float = Field(..., ge=0, le=100, description="Nitrogen level (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=100, description="Phosphorus level (kg/ha)")
    potassium: float = Field(..., ge=0, le=100, description="Potassium level (kg/ha)")
    organic_matter: float = Field(..., ge=0, le=10, description="Organic matter (%)")


class RotationPlanRequest(BaseModel):
    farmer_id: str
    farm_id: str
    location: str
    soil_type: str
    current_nutrients: SoilNutrients
    current_crop: Optional[str] = None
    plan_years: int = Field(default=3, ge=2, le=5)
    prioritize_profit: bool = True


class SoilAnalyzeRequest(BaseModel):
    farm_id: str
    soil_type: str
    current_nutrients: SoilNutrients
    crop_history: List[str] = Field(default_factory=list)


class RotationOptimizeRequest(BaseModel):
    farmer_id: str
    farm_id: str
    existing_plan: List[str]
    current_nutrients: SoilNutrients
    market_prices: Optional[Dict[str, float]] = None


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class CropYearPlan(BaseModel):
    year: int
    crop: str
    season: str
    expected_yield_kg_ha: float
    estimated_profit_inr_ha: float
    soil_impact: str
    rationale: str


class SoilHealthScore(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    nitrogen_score: float
    phosphorus_score: float
    potassium_score: float
    organic_matter_score: float
    health_status: str


class RotationPlanResponse(BaseModel):
    farmer_id: str
    farm_id: str
    plan_years: int
    rotation_plan: List[CropYearPlan]
    soil_health_before: SoilHealthScore
    soil_health_after: SoilHealthScore
    projected_soil_improvement: float
    pest_interruption_crops: List[str]
    sustainability_score: float
    total_projected_profit_inr: float
    recommendations: List[str]


class SoilTrend(BaseModel):
    metric: str
    current_value: float
    trend: str
    predicted_6_months: float
    predicted_12_months: float


class SoilAnalyzeResponse(BaseModel):
    farm_id: str
    soil_type: str
    soil_health_score: SoilHealthScore
    nutrient_trends: List[SoilTrend]
    degradation_risk: str
    depletion_warnings: List[str]
    improvement_actions: List[str]


class CropHistoryEntry(BaseModel):
    year: int
    crop: str
    yield_kg_ha: Optional[float] = None
    soil_health_after: Optional[float] = None


class FarmHistoryResponse(BaseModel):
    farm_id: str
    crop_history: List[CropHistoryEntry]
    soil_trend_summary: str
    avg_soil_health_score: float


class RotationOptimizeResponse(BaseModel):
    farmer_id: str
    farm_id: str
    original_plan: List[str]
    optimized_plan: List[CropYearPlan]
    profitability_improvement: float
    soil_health_improvement: float
    optimization_notes: List[str]
