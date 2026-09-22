"""
Agricultural Carbon Footprint & Farm Eco-Score Service
Calculates emissions from irrigation pump operations and provides sustainability tips.
"""
from typing import List
from app.schemas.irrigation_schema import CarbonCalculateRequest, CarbonCalculateResponse

# Emission factors (kg CO2 per unit)
EMISSION_FACTORS = {
    "Grid Electricity": 0.82,  # kg CO2 / kWh (Indian average grid emission factor)
    "Diesel Generator": 2.68,   # kg CO2 / Liter (direct diesel combustion)
    "Solar": 0.05,             # kg CO2 / kWh (lifecycle embedded emissions)
}

# Average diesel consumption: ~0.3 Liters per kW per hour
DIESEL_LITERS_PER_KWH = 0.35


def compute_carbon_footprint(req: CarbonCalculateRequest) -> CarbonCalculateResponse:
    """Compute energy consumption, carbon emissions, and sustainability metrics."""
    power_source = req.power_source
    factor = EMISSION_FACTORS.get(power_source, 0.82)

    # Energy calculations
    daily_kwh = round(req.motor_power_kw * req.daily_hours_used, 2)
    monthly_kwh = round(daily_kwh * req.days_per_month, 2)
    yearly_kwh = round(monthly_kwh * 12.0, 2)

    # CO2 emissions
    if power_source == "Diesel Generator":
        # Based on diesel liters
        daily_liters = daily_kwh * DIESEL_LITERS_PER_KWH
        daily_co2 = round(daily_liters * factor, 2)
    else:
        daily_co2 = round(daily_kwh * factor, 2)

    monthly_co2 = round(daily_co2 * req.days_per_month, 2)
    yearly_co2 = round(monthly_co2 * 12.0, 2)

    # Diesel equivalent in liters
    diesel_equiv = round(yearly_co2 / 2.68, 1)

    # Solar offset potential (how much CO2 saved if switched to solar)
    solar_yearly = yearly_kwh * EMISSION_FACTORS["Solar"]
    solar_savings = round(max(0.0, yearly_co2 - solar_yearly), 1)

    # Classification
    if daily_co2 < 2.0:
        status = "Low"
    elif daily_co2 <= 6.0:
        status = "Moderate"
    else:
        status = "High"

    # Eco-score: 100 minus emission penalty
    # 0 daily CO2 = 100, 10 kg daily CO2 = 30, 20 kg = 0
    raw_score = 100.0 - (daily_co2 * 5.0)
    if power_source == "Solar":
        raw_score += 20.0
    eco_score = round(max(0.0, min(100.0, raw_score)), 1)

    # Actionable green recommendations
    recommendations: List[str] = []
    if power_source != "Solar":
        recommendations.append(
            f"Adopting a PM-KUSUM solar agricultural pump could abate ~{solar_savings} kg of CO2 annually "
            f"while cutting grid/diesel electricity bills to zero."
        )

    if req.daily_hours_used > 4.0:
        recommendations.append(
            "Installing drip or micro-sprinkler irrigation can reduce pump operating hours by 30-45%, "
            "reducing both water waste and motor wear."
        )

    recommendations.extend([
        "Operate electric motors during off-peak night/morning hours to optimize grid efficiency.",
        "Ensure pump impeller maintenance and correct pipe sizing to prevent hydraulic friction losses.",
        "Incorporate organic soil mulching to conserve topsoil moisture and extend interval between pumping cycles."
    ])

    return CarbonCalculateResponse(
        daily_energy_kwh=daily_kwh,
        monthly_energy_kwh=monthly_kwh,
        daily_co2_kg=daily_co2,
        monthly_co2_kg=monthly_co2,
        yearly_co2_kg=yearly_co2,
        emission_status=status,
        eco_score=eco_score,
        diesel_equivalent_liters=diesel_equiv,
        solar_offset_potential_kg=solar_savings,
        green_recommendations=recommendations,
    )
