"""Feasibility Pydantic schemas"""
from pydantic import BaseModel
from typing import List, Optional

class FeasibilityCheckRequest(BaseModel):
    location: str
    soil_type: str
    season: str = "Kharif"

class CropFeasibility(BaseModel):
    crop: str
    feasibility_score: float
    status: str  # Suitable / Marginal / Not Suitable
    factors: List[str]

class FeasibilityCheckResponse(BaseModel):
    location: str
    soil_type: str
    season: str
    crops: List[CropFeasibility]

class CropFeasibilityInfo(BaseModel):
    crop: str
    best_seasons: List[str]
    suitable_soils: List[str]
    water_requirement: str
    typical_yield_kg_ha: float
