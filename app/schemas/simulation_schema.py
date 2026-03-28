"""Simulation Pydantic schemas"""
from pydantic import BaseModel
from typing import Optional

class SimulationRunRequest(BaseModel):
    crop: str
    area_ha: float
    yield_kg_ha: float
    price_per_kg: float
    cost_per_ha: Optional[float] = None

class SimulationRunResponse(BaseModel):
    crop: str
    area_ha: float
    yield_kg_ha: float
    price_per_kg: float
    total_revenue: float
    total_cost: float
    net_profit: float
    roi_percent: float
    break_even_price_per_kg: float

class SimulationCompareRequest(BaseModel):
    scenario_a: SimulationRunRequest
    scenario_b: SimulationRunRequest

class ScenarioResult(BaseModel):
    scenario: str
    crop: str
    net_profit: float
    roi_percent: float

class SimulationCompareResponse(BaseModel):
    scenario_a: ScenarioResult
    scenario_b: ScenarioResult
    better_scenario: str
    profit_difference: float
