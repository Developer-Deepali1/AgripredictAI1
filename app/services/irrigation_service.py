"""
Smart Irrigation Service (Software-Driven Water Management)
Calculates crop-specific plant stress, water deficit, rainfall offset, and pump runtime.
"""
from typing import Dict, Any, Tuple
from app.schemas.irrigation_schema import IrrigationAdviceRequest, IrrigationAdviceResponse

# Crop optimal soil moisture bounds (min_optimal, max_optimal) in %
CROP_MOISTURE_PROFILES: Dict[str, Tuple[float, float]] = {
    "Rice": (60.0, 85.0),
    "Wheat": (45.0, 65.0),
    "Maize": (50.0, 70.0),
    "Cotton": (40.0, 60.0),
    "Sugarcane": (60.0, 80.0),
    "Potato": (50.0, 70.0),
    "Onion": (45.0, 65.0),
    "Tomato": (50.0, 70.0),
    "Cabbage": (55.0, 75.0),
    "Carrot": (45.0, 65.0),
}


def calculate_plant_stress(temperature: float, soil_moisture: float) -> Tuple[float, str]:
    """
    Calculate plant stress index based on thermal and moisture conditions.
    Formula: (temp / 40.0) * (100 - soil_moisture)
    """
    raw_stress = (max(0.0, temperature) / 40.0) * max(0.0, 100.0 - soil_moisture)
    stress_idx = round(min(100.0, max(0.0, raw_stress)), 1)

    if stress_idx < 25.0:
        level = "OPTIMAL"
    elif stress_idx < 50.0:
        level = "MODERATE"
    elif stress_idx < 75.0:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return stress_idx, level


def evaluate_irrigation(req: IrrigationAdviceRequest) -> IrrigationAdviceResponse:
    """
    Evaluate real-time soil moisture and upcoming rainfall to generate
    smart irrigation guidance.
    """
    crop_name = req.crop.title()
    min_opt, max_opt = CROP_MOISTURE_PROFILES.get(crop_name, (50.0, 70.0))

    stress_idx, stress_level = calculate_plant_stress(req.temperature, req.soil_moisture)

    rain_3d = req.forecast_rain_mm_3d
    has_significant_rain = rain_3d >= 12.0
    has_light_rain = 3.0 <= rain_3d < 12.0

    # Decision logic
    if req.soil_moisture >= min_opt:
        # Soil moisture is already adequate
        irrigation_needed = False
        action = "Hold / Maintain (No Irrigation Needed)"
        duration_hours = 0.0
        volume_liters = 0.0
        reasoning = (
            f"Current soil moisture ({req.soil_moisture:.1f}%) is within optimal range "
            f"({min_opt:.0f}-{max_opt:.0f}%) for {crop_name}. Plant stress index is {stress_idx:.1f} ({stress_level}). "
            f"No additional irrigation is necessary today."
        )
    elif has_significant_rain:
        # Moisture is low, but substantial rain is forecast
        irrigation_needed = False
        action = "Delay Irrigation (Rain Imminent)"
        duration_hours = 0.0
        volume_liters = 0.0
        reasoning = (
            f"Although soil moisture ({req.soil_moisture:.1f}%) is below optimal ({min_opt:.0f}%), "
            f"{rain_3d:.1f}mm of precipitation is predicted over the next 3 days. "
            f"Delay irrigation by 36-48 hours to conserve water, save electricity costs, and avoid waterlogging."
        )
    else:
        # Irrigation required
        irrigation_needed = True
        deficit_pct = min_opt - req.soil_moisture
        # 1% soil moisture deficit roughly corresponds to ~10,000L water per hectare in topsoil
        base_liters_per_ha = max(5000.0, deficit_pct * 10000.0)

        # Discount if light rain expected
        if has_light_rain:
            base_liters_per_ha = max(3000.0, base_liters_per_ha - (rain_3d * 4000.0))

        volume_liters = round(base_liters_per_ha * req.field_area_ha, 0)
        # Standard 1HP pump delivers ~12,000 L/hour
        duration_hours = round(min(12.0, max(0.5, volume_liters / 12000.0)), 1)

        if stress_level in ("HIGH", "CRITICAL"):
            action = "Immediate Irrigation Required"
        else:
            action = "Irrigate During Cool Hours (Evening/Morning)"

        reasoning = (
            f"Soil moisture is deficient at {req.soil_moisture:.1f}% (target: {min_opt:.0f}%). "
            f"Plant stress is {stress_level} (Index: {stress_idx:.1f}). "
            f"Forecasted rainfall ({rain_3d:.1f}mm) is insufficient to replenish root zones. "
            f"Recommend running motor for {duration_hours}h to deliver ~{int(volume_liters):,} Liters."
        )

    # Rain summary
    if rain_3d >= 20.0:
        rain_summary = f"Heavy rainfall predicted: {rain_3d:.1f}mm over next 72 hours."
    elif rain_3d >= 10.0:
        rain_summary = f"Moderate showers predicted: {rain_3d:.1f}mm over next 72 hours."
    elif rain_3d > 0:
        rain_summary = f"Light isolated showers: {rain_3d:.1f}mm over next 72 hours."
    else:
        rain_summary = "Dry weather expected with zero rainfall over next 72 hours."

    return IrrigationAdviceResponse(
        crop=crop_name,
        soil_moisture=req.soil_moisture,
        plant_stress_index=stress_idx,
        stress_level=stress_level,
        irrigation_needed=irrigation_needed,
        recommended_action=action,
        recommended_duration_hours=duration_hours,
        water_volume_liters=volume_liters,
        rain_forecast_summary=rain_summary,
        reasoning=reasoning,
    )
