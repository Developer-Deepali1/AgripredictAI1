"""
Simulation Pydantic schemas
"""
from pydantic import BaseModel
from typing import Dict, Any, Optional

class SimulationRequest(BaseModel):
    """Simulation request schema"""
    scenario: Dict[str, Any]
    crop: str

class SimulationResponse(BaseModel):
    """Simulation response schema"""
    scenario_name: str
    results: Dict[str, Any]
    estimated_profit: float
