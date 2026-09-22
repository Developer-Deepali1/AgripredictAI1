"""
Unit tests for Smart Irrigation & Carbon Footprint API (/api/irrigation)
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_irrigation_advice_adequate_moisture():
    """Verify that adequate soil moisture results in no irrigation needed."""
    payload = {
        "crop": "Rice",
        "soil_moisture": 75.0,
        "temperature": 28.0,
        "humidity": 65.0,
        "forecast_rain_mm_3d": 0.0,
        "field_area_ha": 1.0,
    }
    resp = client.post("/api/irrigation/advice", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["crop"] == "Rice"
    assert data["irrigation_needed"] is False
    assert data["recommended_duration_hours"] == 0.0
    assert "optimal" in data["reasoning"].lower()


def test_irrigation_advice_rain_imminent():
    """Verify that low soil moisture with heavy rain forecast advises delay."""
    payload = {
        "crop": "Wheat",
        "soil_moisture": 35.0,  # low
        "temperature": 26.0,
        "humidity": 70.0,
        "forecast_rain_mm_3d": 18.0,  # heavy rain predicted
        "field_area_ha": 2.0,
    }
    resp = client.post("/api/irrigation/advice", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["crop"] == "Wheat"
    assert data["irrigation_needed"] is False
    assert "delay" in data["recommended_action"].lower()
    assert "precipitation" in data["reasoning"].lower()


def test_irrigation_advice_deficient_requires_irrigation():
    """Verify dry soil with no rain generates motor runtime and water volume."""
    payload = {
        "crop": "Tomato",
        "soil_moisture": 30.0,  # deficient
        "temperature": 34.0,
        "humidity": 45.0,
        "forecast_rain_mm_3d": 0.0,
        "field_area_ha": 1.5,
    }
    resp = client.post("/api/irrigation/advice", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["crop"] == "Tomato"
    assert data["irrigation_needed"] is True
    assert data["plant_stress_index"] > 40.0
    assert data["recommended_duration_hours"] > 0
    assert data["water_volume_liters"] > 5000


def test_carbon_footprint_grid():
    """Test electric pump carbon emission & eco-score calculations."""
    payload = {
        "motor_power_kw": 1.5,  # 2 HP motor
        "daily_hours_used": 3.0,
        "days_per_month": 20,
        "power_source": "Grid Electricity",
    }
    resp = client.post("/api/irrigation/carbon-footprint", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["daily_energy_kwh"] == 4.5
    assert data["monthly_energy_kwh"] == 90.0
    assert data["daily_co2_kg"] > 0.0
    assert 0.0 <= data["eco_score"] <= 100.0
    assert len(data["green_recommendations"]) >= 2


def test_carbon_footprint_solar():
    """Test solar pump eco-score bonus."""
    payload = {
        "motor_power_kw": 2.0,
        "daily_hours_used": 4.0,
        "days_per_month": 30,
        "power_source": "Solar",
    }
    resp = client.post("/api/irrigation/carbon-footprint", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["eco_score"] >= 90.0
    assert data["emission_status"] == "Low"


def test_list_supported_languages():
    """Verify 10 regional Indian languages endpoint."""
    resp = client.get("/api/irrigation/languages")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 10
    codes = [l["code"] for l in data]
    assert "en" in codes
    assert "hi" in codes
    assert "od" in codes
    assert "bn" in codes
    assert "ta" in codes
    assert "te" in codes
