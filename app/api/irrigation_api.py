"""
Smart Irrigation & Agricultural Carbon Footprint API endpoints
"""
import logging
from typing import List

from fastapi import APIRouter, status

from app.core.i18n import get_supported_languages_list
from app.schemas.irrigation_schema import (
    CarbonCalculateRequest,
    CarbonCalculateResponse,
    IrrigationAdviceRequest,
    IrrigationAdviceResponse,
)
from app.services.carbon_service import compute_carbon_footprint
from app.services.irrigation_service import evaluate_irrigation

router = APIRouter()
logger = logging.getLogger("irrigation_api")


@router.post(
    "/advice",
    response_model=IrrigationAdviceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get smart irrigation recommendation based on soil moisture and weather",
)
def get_irrigation_recommendation(payload: IrrigationAdviceRequest) -> IrrigationAdviceResponse:
    """
    Evaluate real-time soil moisture, temperature, humidity, and upcoming rain
    to advise whether to irrigate, delay, or adjust pump runtime.
    """
    logger.info("Irrigation advice requested for crop=%s soil_moisture=%.1f", payload.crop, payload.soil_moisture)
    return evaluate_irrigation(payload)


@router.post(
    "/carbon-footprint",
    response_model=CarbonCalculateResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate agricultural pump carbon footprint and eco-score",
)
def calculate_pump_carbon(payload: CarbonCalculateRequest) -> CarbonCalculateResponse:
    """
    Calculate carbon emissions, energy usage, and sustainability score (0-100)
    for irrigation pumps (grid, diesel, or solar).
    """
    logger.info("Carbon footprint calculation requested: motor=%.2fkW hours=%.1f", payload.motor_power_kw, payload.daily_hours_used)
    return compute_carbon_footprint(payload)


@router.get(
    "/languages",
    summary="List supported regional Indian languages for i18n",
)
def list_languages() -> List[dict]:
    """Return 10 supported regional Indian languages."""
    return get_supported_languages_list()
