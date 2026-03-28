"""Risk Pydantic schemas"""
from pydantic import BaseModel
from typing import List, Dict, Optional

class RiskAssessRequest(BaseModel):
    crop: str
    location: Optional[str] = None
    season: Optional[str] = None

class RiskFactors(BaseModel):
    price_drop_risk: float
    oversupply_risk: float
    weather_risk: float
    market_volatility: float

class RiskAssessResponse(BaseModel):
    crop: str
    overall_risk_score: float
    risk_level: str
    risk_factors: RiskFactors
    mitigation_strategies: List[str]

class RiskFactor(BaseModel):
    name: str
    description: str
    impact: str

class MitigationStrategy(BaseModel):
    strategy: str
    applicable_risks: List[str]
    effectiveness: str
