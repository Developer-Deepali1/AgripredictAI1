"""
What-If Simulation API endpoints
"""
from fastapi import APIRouter, HTTPException, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.simulation_schema import (
    ScenarioResult,
    SimulationCompareRequest,
    SimulationCompareResponse,
    SimulationRunRequest,
    SimulationRunResponse,
)

router = APIRouter()

_DEFAULT_COSTS: dict = {
    "Rice": 35000, "Wheat": 30000, "Maize": 25000, "Cotton": 50000,
    "Sugarcane": 80000, "Potato": 70000, "Onion": 55000, "Tomato": 75000,
    "Cabbage": 50000, "Carrot": 45000,
}


def _normalize_crop(crop: str) -> str:
    for c in SUPPORTED_CROPS:
        if c.lower() == crop.lower():
            return c
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Crop '{crop}' not supported.")


def _run_sim(req: SimulationRunRequest) -> SimulationRunResponse:
    crop = _normalize_crop(req.crop)
    if req.area_ha <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="area_ha must be positive.")
    if req.yield_kg_ha <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="yield_kg_ha must be positive.")

    cost_per_ha = req.cost_per_ha if req.cost_per_ha is not None else _DEFAULT_COSTS[crop]
    total_revenue = round(req.yield_kg_ha * req.price_per_kg * req.area_ha, 2)
    total_cost = round(cost_per_ha * req.area_ha, 2)
    net_profit = round(total_revenue - total_cost, 2)
    roi = round((net_profit / total_cost) * 100, 2) if total_cost else 0.0
    break_even = round(total_cost / (req.yield_kg_ha * req.area_ha), 4) if req.yield_kg_ha and req.area_ha else 0.0

    return SimulationRunResponse(
        crop=crop,
        area_ha=req.area_ha,
        yield_kg_ha=req.yield_kg_ha,
        price_per_kg=req.price_per_kg,
        total_revenue=total_revenue,
        total_cost=total_cost,
        net_profit=net_profit,
        roi_percent=roi,
        break_even_price_per_kg=break_even,
    )


@router.post("/run", response_model=SimulationRunResponse)
def run_simulation(payload: SimulationRunRequest) -> SimulationRunResponse:
    """Run a what-if simulation to estimate profit for given crop parameters."""
    return _run_sim(payload)


@router.post("/compare", response_model=SimulationCompareResponse)
def compare_simulations(payload: SimulationCompareRequest) -> SimulationCompareResponse:
    """Compare two simulation scenarios and identify the better option."""
    result_a = _run_sim(payload.scenario_a)
    result_b = _run_sim(payload.scenario_b)
    better = "A" if result_a.net_profit >= result_b.net_profit else "B"
    return SimulationCompareResponse(
        scenario_a=ScenarioResult(
            scenario="A", crop=result_a.crop,
            net_profit=result_a.net_profit, roi_percent=result_a.roi_percent,
        ),
        scenario_b=ScenarioResult(
            scenario="B", crop=result_b.crop,
            net_profit=result_b.net_profit, roi_percent=result_b.roi_percent,
        ),
        better_scenario=better,
        profit_difference=round(abs(result_a.net_profit - result_b.net_profit), 2),
    )
