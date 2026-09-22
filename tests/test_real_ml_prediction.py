"""
Unit and integration tests for real Scikit-Learn Crop Recommendation ML pipeline
and ML-powered Market Price forecasting.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_real_ml_crop_recommendation_rice():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "nitrogen": 80.0,
            "phosphorus": 48.0,
            "potassium": 40.0,
            "temperature": 24.0,
            "humidity": 82.0,
            "ph": 6.4,
            "rainfall": 230.0,
            "top_n": 5
        }
        res = await ac.post("/api/prediction/recommend-ml", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["model_type"] == "RandomForestClassifier"
        assert data["model_accuracy"] > 90.0
        assert len(data["recommendations"]) == 5
        
        # High rainfall + high humidity + high N = Rice should be top pick
        top_crop = data["recommendations"][0]
        assert top_crop["crop"] == "Rice"
        assert top_crop["probability"] > 50.0

@pytest.mark.asyncio
async def test_real_ml_crop_recommendation_chickpea():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "nitrogen": 40.0,
            "phosphorus": 68.0,
            "potassium": 79.0,
            "temperature": 19.0,
            "humidity": 17.0,
            "ph": 7.3,
            "rainfall": 80.0,
            "top_n": 3
        }
        res = await ac.post("/api/prediction/recommend-ml", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert len(data["recommendations"]) == 3
        top_crops = [c["crop"] for c in data["recommendations"]]
        assert "Chickpea" in top_crops

@pytest.mark.asyncio
async def test_real_ml_market_price_prediction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/prediction/prices/Rice")
        assert res.status_code == 200
        data = res.json()
        assert data["crop"] == "Rice"
        assert "trend_direction" in data
        assert len(data["predicted_prices"]) == 6
        for p in data["predicted_prices"]:
            assert p["price"] > 0
            assert p["lower_bound"] <= p["price"]
            assert p["upper_bound"] >= p["price"]
