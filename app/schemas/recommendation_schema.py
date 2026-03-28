"""Recommendation Pydantic schemas"""
from pydantic import BaseModel
from typing import List, Optional

class SmartRecommendation(BaseModel):
    crop_name: str
    profit_score: float
    feasibility_score: float
    risk_score: float
    combined_score: float
    reasons: List[str]
    recommendation_rank: int

class SmartRecommendationResponse(BaseModel):
    recommendations: List[SmartRecommendation]
    generated_at: str

class RecommendationExplanation(BaseModel):
    crop: str
    summary: str
    profit_analysis: str
    risk_analysis: str
    feasibility_analysis: str
    market_outlook: str
    tips: List[str]
