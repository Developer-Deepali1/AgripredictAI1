"""
Profit Calculation API endpoints
"""
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.profit_schema import (
    CostBreakdown,
    CropProfitComparison,
    ProfitCalculateRequest,
    ProfitCalculateResponse,
)

router = APIRouter()

# Per-ha cost and yield data (INR per ha)
_CROP_DATA: dict = {
    "Rice":      {"yield": 3500,  "price": 21.0,  "cost": 35000,
                  "seeds": 3500,  "fert": 10000, "labor": 12000, "irr": 6000, "other": 3500},
    "Wheat":     {"yield": 3200,  "price": 23.0,  "cost": 30000,
                  "seeds": 3000,  "fert": 9000,  "labor": 9000,  "irr": 5500, "other": 3500},
    "Maize":     {"yield": 2800,  "price": 15.0,  "cost": 25000,
                  "seeds": 2500,  "fert": 7500,  "labor": 8000,  "irr": 4500, "other": 2500},
    "Cotton":    {"yield": 1800,  "price": 55.0,  "cost": 50000,
                  "seeds": 5000,  "fert": 12000, "labor": 18000, "irr": 8000, "other": 7000},
    "Sugarcane": {"yield": 70000, "price": 3.5,   "cost": 80000,
                  "seeds": 15000, "fert": 20000, "labor": 25000, "irr": 12000, "other": 8000},
    "Potato":    {"yield": 22000, "price": 8.0,   "cost": 70000,
                  "seeds": 20000, "fert": 15000, "labor": 18000, "irr": 10000, "other": 7000},
    "Onion":     {"yield": 16000, "price": 15.0,  "cost": 55000,
                  "seeds": 5000,  "fert": 14000, "labor": 18000, "irr": 10000, "other": 8000},
    "Tomato":    {"yield": 25000, "price": 18.0,  "cost": 75000,
                  "seeds": 8000,  "fert": 18000, "labor": 25000, "irr": 12000, "other": 12000},
    "Cabbage":   {"yield": 30000, "price": 7.0,   "cost": 50000,
                  "seeds": 6000,  "fert": 12000, "labor": 16000, "irr": 8000, "other": 8000},
    "Carrot":    {"yield": 20000, "price": 10.0,  "cost": 45000,
                  "seeds": 5000,  "fert": 11000, "labor": 14000, "irr": 8000, "other": 7000},
}


def _normalize_crop(crop: str) -> str:
    for c in SUPPORTED_CROPS:
        if c.lower() == crop.lower():
            return c
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Crop '{crop}' not supported.")


@router.post("/calculate", response_model=ProfitCalculateResponse)
def calculate_profit(payload: ProfitCalculateRequest) -> ProfitCalculateResponse:
    """Calculate expected profit for a crop given area in hectares."""
    if payload.area_ha <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="area_ha must be positive.")
    crop = _normalize_crop(payload.crop)
    d = _CROP_DATA[crop]
    area = payload.area_ha

    total_revenue = round(d["yield"] * d["price"] * area, 2)
    total_cost = round(d["cost"] * area, 2)
    net_profit = round(total_revenue - total_cost, 2)
    profit_per_ha = round(net_profit / area, 2)
    roi = round((net_profit / total_cost) * 100, 2) if total_cost else 0.0

    return ProfitCalculateResponse(
        crop=crop,
        area_ha=area,
        expected_yield_kg_ha=d["yield"],
        predicted_price_per_kg=d["price"],
        total_revenue=total_revenue,
        estimated_cost=total_cost,
        net_profit=net_profit,
        profit_per_ha=profit_per_ha,
        cost_breakdown=CostBreakdown(
            seeds=round(d["seeds"] * area, 2),
            fertilizer=round(d["fert"] * area, 2),
            labor=round(d["labor"] * area, 2),
            irrigation=round(d["irr"] * area, 2),
            other=round(d["other"] * area, 2),
        ),
        roi_percent=roi,
    )


@router.get("/comparison", response_model=List[CropProfitComparison])
def get_profit_comparison(
    season: Optional[str] = Query(None, description="Filter by season (Kharif/Rabi/Zaid)")
) -> List[CropProfitComparison]:
    """Compare profitability across all supported crops per hectare."""
    _SEASON_CROPS: dict = {
        "Kharif": ["Rice", "Maize", "Cotton", "Sugarcane", "Onion", "Tomato"],
        "Rabi":   ["Wheat", "Potato", "Onion", "Cabbage", "Carrot", "Tomato"],
        "Zaid":   ["Maize", "Sugarcane", "Tomato"],
    }
    crops_to_show = SUPPORTED_CROPS
    if season:
        key = season.title()
        crops_to_show = _SEASON_CROPS.get(key, SUPPORTED_CROPS)

    result: List[CropProfitComparison] = []
    for crop in crops_to_show:
        d = _CROP_DATA[crop]
        rev = round(d["yield"] * d["price"], 2)
        cost = float(d["cost"])
        profit = round(rev - cost, 2)
        roi = round((profit / cost) * 100, 2) if cost else 0.0
        result.append(CropProfitComparison(
            crop=crop,
            profit_per_ha=profit,
            revenue_per_ha=rev,
            cost_per_ha=cost,
            roi_percent=roi,
        ))

    result.sort(key=lambda x: x.profit_per_ha, reverse=True)
    return result
