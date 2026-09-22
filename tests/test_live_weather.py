"""
Unit tests for live meteorological weather integration (Open-Meteo).
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_live_weather_by_district():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/data/weather/live?location=Bhubaneswar")
        assert res.status_code == 200
        data = res.json()
        assert "temperature" in data
        assert "humidity" in data
        assert "rainfall_forecast_7d" in data
        assert isinstance(data["temperature"], (int, float))
        assert isinstance(data["humidity"], (int, float))

@pytest.mark.asyncio
async def test_live_weather_by_coordinates():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/data/weather/live?lat=19.99&lon=73.78&location=Nashik")
        assert res.status_code == 200
        data = res.json()
        assert data["latitude"] == 19.99
        assert data["longitude"] == 73.78
        assert "daily_forecast" in data
