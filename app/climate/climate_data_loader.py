"""
climate_data_loader.py
======================
Loads and preprocesses historical climate data and IPCC-style climate projections
for a given geographic location.

Data sources (synthetic / representative):
  - Historical temperature, rainfall, and humidity are estimated from latitude-based
    climate zones with realistic seasonal and stochastic variation.
  - IPCC AR6 representative concentration pathways (RCP 4.5 / SSP2) provide baseline
    change projections that are applied on top of the historical baseline.
  - Soil parameters are passed in directly from the API request (e.g., IoT sensors).

Caching:
  - A simple in-process LRU-style cache (dict keyed on rounded lat/lon) avoids
    redundant regeneration of historical series within the same server process.

Public API:
    load_climate_data(latitude, longitude, soil_ph, nitrogen, phosphorus, potassium)
        -> ClimateDataBundle
"""

from __future__ import annotations

import hashlib
import logging
import math
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Dict, List

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class YearlyClimate:
    """Climate summary for a single calendar year."""
    year: int
    avg_temperature: float   # °C
    total_rainfall: float    # mm
    avg_humidity: float      # %


@dataclass
class SoilProfile:
    """Soil chemical / physical parameters supplied by the farmer / IoT sensors."""
    ph: float
    nitrogen: float    # kg/ha
    phosphorus: float  # kg/ha
    potassium: float   # kg/ha


@dataclass
class ClimateDataBundle:
    """Container returned by load_climate_data()."""
    latitude: float
    longitude: float
    soil: SoilProfile
    historical: List[YearlyClimate]          # Past 10 years
    # IPCC-aligned trend parameters (used by the prediction model)
    baseline_temp: float                     # Mean temperature (°C) of latest 5-year period
    baseline_rainfall: float                 # Mean annual rainfall (mm)
    baseline_humidity: float                 # Mean relative humidity (%)
    # Annual climate change deltas per year (RCP-4.5 / SSP2 representative values)
    temp_trend_per_year: float               # °C / year
    rainfall_trend_per_year: float           # mm / year
    humidity_trend_per_year: float           # % / year
    # Köppen climate zone (informational)
    climate_zone: str


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

# IPCC AR6 SSP2-4.5 representative global mean surface temperature increase
# (~+0.2 °C / decade => +0.02 °C / year) and rainfall reduction for drylands.
_IPCC_TEMP_TREND = 0.02        # °C per year
_IPCC_RAINFALL_TREND = -1.5   # mm per year (slight drying trend, conservative)
_IPCC_HUMIDITY_TREND = -0.05  # % per year

# In-process result cache  keyed on (lat_rounded, lon_rounded)
_CACHE: Dict[str, ClimateDataBundle] = {}
_CACHE_MAX_SIZE = 512


def _cache_key(lat: float, lon: float) -> str:
    """Round to 0.5° grid for cache lookup."""
    lat_r = round(lat * 2) / 2
    lon_r = round(lon * 2) / 2
    return f"{lat_r:.1f}_{lon_r:.1f}"


def _koppen_zone(lat: float, baseline_temp: float, baseline_rainfall: float) -> str:
    """Classify a rough Köppen-Geiger climate zone from basic statistics."""
    abs_lat = abs(lat)
    if baseline_temp >= 18 and baseline_rainfall >= 1500:
        return "Tropical Wet (Af)"
    if baseline_temp >= 18 and baseline_rainfall >= 750:
        return "Tropical Monsoon (Am)"
    if baseline_temp >= 18:
        return "Tropical Savanna (Aw)"
    if baseline_temp >= 10 and abs_lat < 35:
        return "Semi-Arid / Steppe (BS)"
    if baseline_temp >= 10:
        return "Temperate / Mediterranean (Cs)"
    if baseline_temp >= 0:
        return "Continental (Df)"
    return "Polar / Alpine (ET)"


def _deterministic_history(lat: float, lon: float) -> List[YearlyClimate]:
    """
    Generate 10 years of synthetic historical climate data for a location.

    The values are deterministic (seeded from lat/lon) so that the same location
    always produces the same history, enabling consistent test and demo behaviour.

    Temperature baseline is estimated from latitude (tropical/subtropical regions
    of India and South Asia are the primary target).
    """
    import random

    # Latitude-based temperature model (approximate mean annual temperature)
    # Equatorial: ~28 °C  |  25°N (India belt): ~25 °C  |  35°N: ~18 °C
    base_temp = max(5.0, 30.0 - abs(lat) * 0.4)

    # Longitude contributes continental vs coastal humidity
    base_humidity = 70.0 - max(0.0, (abs(lon) - 60.0) * 0.1)
    base_humidity = min(90.0, max(40.0, base_humidity))

    # Approximate monsoon rainfall from latitude (India-centric)
    if 8 <= lat <= 30:          # Indian subcontinent belt
        base_rain = 1100.0 - abs(lat - 17) * 20
    else:
        base_rain = max(200.0, 800.0 - abs(lat) * 10)

    seed_val = int(abs(lat * 1000) + abs(lon * 1000)) % (2 ** 31)
    rng = random.Random(seed_val)

    history: List[YearlyClimate] = []
    current_year = 2024
    for i in range(10):
        year = current_year - 9 + i
        temp = round(base_temp + rng.gauss(0, 0.6), 2)
        rain = round(max(50.0, base_rain + rng.gauss(0, 80)), 1)
        hum  = round(min(95.0, max(30.0, base_humidity + rng.gauss(0, 3))), 1)
        history.append(YearlyClimate(year=year, avg_temperature=temp,
                                      total_rainfall=rain, avg_humidity=hum))
    return history


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def load_climate_data(
    latitude: float,
    longitude: float,
    soil_ph: float,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
) -> ClimateDataBundle:
    """Load and return a :class:`ClimateDataBundle` for the given location.

    Results are cached in-process so repeated calls for the same grid cell are
    essentially free.

    Args:
        latitude:    Decimal degrees (−90 to +90).
        longitude:   Decimal degrees (−180 to +180).
        soil_ph:     Soil pH (0–14).
        nitrogen:    Available nitrogen (kg/ha).
        phosphorus:  Available phosphorus (kg/ha).
        potassium:   Available potassium (kg/ha).

    Returns:
        A populated :class:`ClimateDataBundle`.
    """
    ck = _cache_key(latitude, longitude)
    if ck in _CACHE:
        bundle = _CACHE[ck]
        # Update soil profile (IoT sensors may update between calls)
        bundle.soil = SoilProfile(ph=soil_ph, nitrogen=nitrogen,
                                   phosphorus=phosphorus, potassium=potassium)
        logger.debug("Climate data cache hit for %s", ck)
        return bundle

    logger.info("Loading climate data for the requested location")

    historical = _deterministic_history(latitude, longitude)

    # Baseline from last 5 years of historical data
    recent = historical[-5:]
    baseline_temp     = round(sum(y.avg_temperature for y in recent) / 5, 2)
    baseline_rainfall = round(sum(y.total_rainfall  for y in recent) / 5, 1)
    baseline_humidity = round(sum(y.avg_humidity    for y in recent) / 5, 1)

    # Latitude-adjusted IPCC trend – regions closer to equator face steeper
    # warming due to tropical amplification.
    lat_factor = 1.0 + max(0.0, (20.0 - abs(latitude)) / 40.0) * 0.2
    temp_trend    = round(_IPCC_TEMP_TREND * lat_factor, 4)
    rain_trend    = round(_IPCC_RAINFALL_TREND * lat_factor, 3)
    humid_trend   = _IPCC_HUMIDITY_TREND

    climate_zone = _koppen_zone(latitude, baseline_temp, baseline_rainfall)

    bundle = ClimateDataBundle(
        latitude=latitude,
        longitude=longitude,
        soil=SoilProfile(ph=soil_ph, nitrogen=nitrogen,
                          phosphorus=phosphorus, potassium=potassium),
        historical=historical,
        baseline_temp=baseline_temp,
        baseline_rainfall=baseline_rainfall,
        baseline_humidity=baseline_humidity,
        temp_trend_per_year=temp_trend,
        rainfall_trend_per_year=rain_trend,
        humidity_trend_per_year=humid_trend,
        climate_zone=climate_zone,
    )

    # Evict oldest entry if cache is full
    if len(_CACHE) >= _CACHE_MAX_SIZE:
        oldest_key = next(iter(_CACHE))
        del _CACHE[oldest_key]

    _CACHE[ck] = bundle
    return bundle
