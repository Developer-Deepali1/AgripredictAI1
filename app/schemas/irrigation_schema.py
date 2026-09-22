"""
Smart Irrigation & Carbon Footprint Pydantic Schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class IrrigationAdviceRequest(BaseModel):
    """Input parameters for software-driven irrigation advice."""
    crop: str = Field(default="Rice", description="Crop name")
    soil_moisture: float = Field(..., ge=0, le=100, description="Current soil moisture percentage (0-100%)")
    temperature: float = Field(default=30.0, ge=-10, le=60, description="Ambient temperature in °C")
    humidity: float = Field(default=60.0, ge=0, le=100, description="Ambient humidity percentage (0-100%)")
    soil_type: Optional[str] = Field(default="Loamy", description="Soil type (Alluvial, Black, Red, Sandy, Loamy, Clay)")
    forecast_rain_mm_3d: float = Field(default=0.0, ge=0, description="Anticipated rainfall in mm over next 3 days")
    field_area_ha: float = Field(default=1.0, gt=0, description="Field area in hectares")


class IrrigationAdviceResponse(BaseModel):
    """Smart irrigation guidance response."""
    crop: str
    soil_moisture: float
    plant_stress_index: float = Field(..., description="Plant stress index (0-100). Higher means higher water stress.")
    stress_level: str = Field(..., description="'OPTIMAL', 'MODERATE', 'HIGH', or 'CRITICAL'")
    irrigation_needed: bool = Field(..., description="Whether to turn ON irrigation immediately")
    recommended_action: str = Field(..., description="Actionable headline directive (e.g., 'Delay Irrigation', 'Irrigate Now')")
    recommended_duration_hours: float = Field(..., description="Estimated motor runtime in hours if irrigating")
    water_volume_liters: float = Field(..., description="Recommended irrigation volume in Liters")
    rain_forecast_summary: str = Field(..., description="Evaluation of upcoming precipitation")
    reasoning: str = Field(..., description="Detailed agronomic reasoning")


class CarbonCalculateRequest(BaseModel):
    """Input payload for agricultural pump carbon footprint calculator."""
    motor_power_kw: float = Field(default=0.75, gt=0, description="Motor pump power in kW (e.g. 0.75kW = 1HP)")
    daily_hours_used: float = Field(..., ge=0, le=24, description="Average operating hours per day")
    days_per_month: int = Field(default=25, ge=1, le=31, description="Operating days per month")
    power_source: str = Field(default="Grid Electricity", description="'Grid Electricity', 'Diesel Generator', or 'Solar'")


class CarbonCalculateResponse(BaseModel):
    """Carbon footprint & farm eco-score metrics."""
    daily_energy_kwh: float
    monthly_energy_kwh: float
    daily_co2_kg: float
    monthly_co2_kg: float
    yearly_co2_kg: float
    emission_status: str = Field(..., description="'Low', 'Moderate', or 'High'")
    eco_score: float = Field(..., description="Sustainability score (0-100). Higher indicates cleaner/more efficient farm.")
    diesel_equivalent_liters: float = Field(..., description="Equivalent diesel fuel consumption in liters")
    solar_offset_potential_kg: float = Field(..., description="CO2 that could be saved per year by switching to solar pumping")
    green_recommendations: List[str] = Field(..., description="Sustainability and cost-cutting tips")
