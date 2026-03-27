"""
Recommendation Pydantic schemas
"""
from pydantic import BaseModel
from typing import List, Dict, Any

class RecommendationRequest(BaseModel):
    """Recommendation request schema"""
    location: str
    season: str

class RecommendationResponse(BaseModel):
    """Recommendation response schema"""
    recommendations: List[Dict[str, Any]]
    overall_confidence: float
