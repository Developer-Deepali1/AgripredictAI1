"""
Crop Rotation Planning & Soil Health Optimizer API endpoints

Endpoints:
  POST /rotation/plan                      – Generate multi-year rotation plan
  GET  /rotation/recommendations/{farmer_id} – Get customised plan for a farmer
  POST /rotation/analyze                   – Analyse soil health and degradation
  GET  /rotation/history/{farm_id}         – Track crop history and soil trends
  POST /rotation/optimize                  – Optimise existing plan for profitability
"""
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.engines.rotation_engine import (
    ALL_CROPS,
    analyze_soil,
    build_rotation_plan,
    calculate_soil_health,
    optimize_rotation,
)
from app.schemas.rotation_schema import (
    FarmHistoryResponse,
    RotationOptimizeRequest,
    RotationOptimizeResponse,
    RotationPlanRequest,
    RotationPlanResponse,
    SoilAnalyzeRequest,
    SoilAnalyzeResponse,
)

router = APIRouter()
logger = logging.getLogger("rotation_api")

# ---------------------------------------------------------------------------
# POST /rotation/plan
# ---------------------------------------------------------------------------

@router.post("/plan", response_model=RotationPlanResponse)
def generate_rotation_plan(payload: RotationPlanRequest) -> RotationPlanResponse:
    """Generate a multi-year crop rotation plan optimised by a genetic algorithm.

    The plan balances soil health, pest cycle interruption, and profitability
    across the requested number of years.
    """
    logger.info(
        "Rotation plan requested | farmer=%s farm=%s years=%d",
        payload.farmer_id, payload.farm_id, payload.plan_years,
    )

    nutrients = {
        "nitrogen": payload.current_nutrients.nitrogen,
        "phosphorus": payload.current_nutrients.phosphorus,
        "potassium": payload.current_nutrients.potassium,
        "organic_matter": payload.current_nutrients.organic_matter,
    }

    try:
        plan_data = build_rotation_plan(
            farmer_id=payload.farmer_id,
            farm_id=payload.farm_id,
            initial_nutrients=nutrients,
            plan_years=payload.plan_years,
            prioritize_profit=payload.prioritize_profit,
            current_crop=payload.current_crop,
        )
    except Exception as exc:
        logger.exception("Error generating rotation plan: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate rotation plan. Please try again.",
        ) from exc

    return RotationPlanResponse(**plan_data)


# ---------------------------------------------------------------------------
# GET /rotation/recommendations/{farmer_id}
# ---------------------------------------------------------------------------

@router.get("/recommendations/{farmer_id}", response_model=RotationPlanResponse)
def get_farmer_recommendations(
    farmer_id: str,
    soil_type: str = Query(default="Loamy"),
    nitrogen: float = Query(default=50.0, ge=0, le=100),
    phosphorus: float = Query(default=25.0, ge=0, le=100),
    potassium: float = Query(default=40.0, ge=0, le=100),
    organic_matter: float = Query(default=2.5, ge=0, le=10),
    current_crop: Optional[str] = Query(default=None),
    plan_years: int = Query(default=3, ge=2, le=5),
) -> RotationPlanResponse:
    """Return a customised crop rotation recommendation for a farmer.

    Accepts current soil nutrient levels as query parameters; uses defaults
    representative of average Indian farmland if not supplied.
    """
    logger.info("Recommendations requested | farmer=%s", farmer_id)

    nutrients = {
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "organic_matter": organic_matter,
    }

    try:
        plan_data = build_rotation_plan(
            farmer_id=farmer_id,
            farm_id=f"farm_{farmer_id}",
            initial_nutrients=nutrients,
            plan_years=plan_years,
            prioritize_profit=True,
            current_crop=current_crop,
        )
    except Exception as exc:
        logger.exception("Error generating recommendations: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations.",
        ) from exc

    return RotationPlanResponse(**plan_data)


# ---------------------------------------------------------------------------
# POST /rotation/analyze
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=SoilAnalyzeResponse)
def analyze_soil_health(payload: SoilAnalyzeRequest) -> SoilAnalyzeResponse:
    """Analyse current soil health and predict nutrient trends.

    Returns a soil health score, degradation risk, depletion warnings, and
    suggested improvement actions based on the crop history provided.
    """
    logger.info("Soil analysis requested | farm=%s soil=%s", payload.farm_id, payload.soil_type)

    nutrients = {
        "nitrogen": payload.current_nutrients.nitrogen,
        "phosphorus": payload.current_nutrients.phosphorus,
        "potassium": payload.current_nutrients.potassium,
        "organic_matter": payload.current_nutrients.organic_matter,
    }

    try:
        analysis = analyze_soil(
            farm_id=payload.farm_id,
            soil_type=payload.soil_type,
            nutrients=nutrients,
            crop_history=payload.crop_history,
        )
    except Exception as exc:
        logger.exception("Error analysing soil: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyse soil data.",
        ) from exc

    return SoilAnalyzeResponse(**analysis)


# ---------------------------------------------------------------------------
# GET /rotation/history/{farm_id}
# ---------------------------------------------------------------------------

@router.get("/history/{farm_id}", response_model=FarmHistoryResponse)
def get_farm_history(
    farm_id: str,
    crops: Optional[str] = Query(
        default=None,
        description="Comma-separated list of past crops in chronological order, e.g. Rice,Wheat,Maize",
    ),
) -> FarmHistoryResponse:
    """Return crop history and a soil trend summary for a farm.

    Pass the ``crops`` query parameter with a comma-separated list of past crops
    to see how each season has impacted soil health over time.
    """
    logger.info("Farm history requested | farm=%s", farm_id)

    history_list = [c.strip() for c in crops.split(",")] if crops else []

    history_entries = []
    nitrogen, phosphorus, potassium, om = 60.0, 30.0, 45.0, 3.0
    running_health_sum = 0.0

    for year_idx, crop_name in enumerate(history_list, start=1):
        info = ALL_CROPS.get(crop_name, {})
        nitrogen = max(0.0, nitrogen + info.get("nitrogen_impact", 0))
        phosphorus = max(0.0, phosphorus + info.get("phosphorus_impact", 0))
        potassium = max(0.0, potassium + info.get("potassium_impact", 0))
        om = max(0.0, om + info.get("organic_matter_impact", 0))

        health = calculate_soil_health(nitrogen, phosphorus, potassium, om)
        running_health_sum += health["overall_score"]

        history_entries.append({
            "year": year_idx,
            "crop": crop_name,
            "yield_kg_ha": info.get("typical_yield_kg_ha"),
            "soil_health_after": health["overall_score"],
        })

    avg_health = round(running_health_sum / len(history_list), 1) if history_list else 0.0

    if avg_health >= 70:
        trend_summary = "Soil health has been well-maintained across the recorded history."
    elif avg_health >= 50:
        trend_summary = "Moderate soil health – consider introducing legumes to restore nutrients."
    else:
        trend_summary = "Soil health is declining – immediate intervention recommended."

    return FarmHistoryResponse(
        farm_id=farm_id,
        crop_history=history_entries,
        soil_trend_summary=trend_summary,
        avg_soil_health_score=avg_health,
    )


# ---------------------------------------------------------------------------
# POST /rotation/optimize
# ---------------------------------------------------------------------------

@router.post("/optimize", response_model=RotationOptimizeResponse)
def optimize_existing_plan(payload: RotationOptimizeRequest) -> RotationOptimizeResponse:
    """Optimise an existing rotation plan for higher profitability and soil health.

    Accepts the current rotation plan as a list of crop names, and optionally
    custom market prices to tailor the optimisation to current market conditions.
    """
    logger.info(
        "Rotation optimise requested | farmer=%s farm=%s",
        payload.farmer_id, payload.farm_id,
    )

    if not payload.existing_plan:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="existing_plan must contain at least one crop.",
        )

    nutrients = {
        "nitrogen": payload.current_nutrients.nitrogen,
        "phosphorus": payload.current_nutrients.phosphorus,
        "potassium": payload.current_nutrients.potassium,
        "organic_matter": payload.current_nutrients.organic_matter,
    }

    try:
        result = optimize_rotation(
            farmer_id=payload.farmer_id,
            farm_id=payload.farm_id,
            existing_plan=payload.existing_plan,
            initial_nutrients=nutrients,
            market_prices=payload.market_prices,
        )
    except Exception as exc:
        logger.exception("Error optimising rotation: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to optimise rotation plan.",
        ) from exc

    return RotationOptimizeResponse(**result)
