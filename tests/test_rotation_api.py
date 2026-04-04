"""
Tests for Crop Rotation Planning & Soil Health Optimizer API.

All tests run in-process using FastAPI's TestClient – no external services
or database required.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api import rotation_api


# ---------------------------------------------------------------------------
# Test app / client fixture
# ---------------------------------------------------------------------------

def _make_client() -> TestClient:
    app = FastAPI()
    app.include_router(rotation_api.router, prefix="/api/rotation")
    return TestClient(app)


@pytest.fixture()
def client() -> TestClient:
    return _make_client()


# ---------------------------------------------------------------------------
# Shared payloads
# ---------------------------------------------------------------------------

HEALTHY_NUTRIENTS = {
    "nitrogen": 60.0,
    "phosphorus": 30.0,
    "potassium": 45.0,
    "organic_matter": 3.0,
}

POOR_NUTRIENTS = {
    "nitrogen": 10.0,
    "phosphorus": 5.0,
    "potassium": 8.0,
    "organic_matter": 0.5,
}

PLAN_PAYLOAD = {
    "farmer_id": "farmer_001",
    "farm_id": "farm_001",
    "location": "Odisha",
    "soil_type": "Alluvial",
    "current_nutrients": HEALTHY_NUTRIENTS,
    "current_crop": "Rice",
    "plan_years": 3,
    "prioritize_profit": True,
}

ANALYZE_PAYLOAD = {
    "farm_id": "farm_001",
    "soil_type": "Alluvial",
    "current_nutrients": HEALTHY_NUTRIENTS,
    "crop_history": ["Rice", "Wheat", "Maize"],
}

OPTIMIZE_PAYLOAD = {
    "farmer_id": "farmer_001",
    "farm_id": "farm_001",
    "existing_plan": ["Rice", "Wheat", "Maize"],
    "current_nutrients": HEALTHY_NUTRIENTS,
    "market_prices": None,
}


# ---------------------------------------------------------------------------
# POST /api/rotation/plan
# ---------------------------------------------------------------------------

class TestGenerateRotationPlan:
    def test_returns_200_with_valid_payload(self, client):
        response = client.post("/api/rotation/plan", json=PLAN_PAYLOAD)
        assert response.status_code == 200

    def test_response_contains_rotation_plan(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert "rotation_plan" in body
        assert len(body["rotation_plan"]) == PLAN_PAYLOAD["plan_years"]

    def test_rotation_plan_years_numbered_correctly(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        years = [entry["year"] for entry in body["rotation_plan"]]
        assert years == list(range(1, PLAN_PAYLOAD["plan_years"] + 1))

    def test_response_includes_soil_health_scores(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert "soil_health_before" in body
        assert "soil_health_after" in body
        before = body["soil_health_before"]
        assert "overall_score" in before
        assert 0 <= before["overall_score"] <= 100

    def test_total_profit_is_positive(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert body["total_projected_profit_inr"] > 0

    def test_sustainability_score_in_valid_range(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert 0 <= body["sustainability_score"] <= 100

    def test_recommendations_list_not_empty(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert isinstance(body["recommendations"], list)
        assert len(body["recommendations"]) > 0

    def test_plan_with_poor_soil(self, client):
        payload = dict(PLAN_PAYLOAD, current_nutrients=POOR_NUTRIENTS)
        response = client.post("/api/rotation/plan", json=payload)
        assert response.status_code == 200
        body = response.json()
        # Poor soil should still produce a valid plan
        assert len(body["rotation_plan"]) == PLAN_PAYLOAD["plan_years"]

    def test_plan_for_5_years(self, client):
        payload = dict(PLAN_PAYLOAD, plan_years=5)
        body = client.post("/api/rotation/plan", json=payload).json()
        assert len(body["rotation_plan"]) == 5

    def test_plan_for_2_years(self, client):
        payload = dict(PLAN_PAYLOAD, plan_years=2)
        body = client.post("/api/rotation/plan", json=payload).json()
        assert len(body["rotation_plan"]) == 2

    def test_plan_years_below_minimum_returns_422(self, client):
        payload = dict(PLAN_PAYLOAD, plan_years=1)
        response = client.post("/api/rotation/plan", json=payload)
        assert response.status_code == 422

    def test_plan_years_above_maximum_returns_422(self, client):
        payload = dict(PLAN_PAYLOAD, plan_years=6)
        response = client.post("/api/rotation/plan", json=payload)
        assert response.status_code == 422

    def test_negative_nitrogen_returns_422(self, client):
        bad_nutrients = dict(HEALTHY_NUTRIENTS, nitrogen=-5)
        payload = dict(PLAN_PAYLOAD, current_nutrients=bad_nutrients)
        response = client.post("/api/rotation/plan", json=payload)
        assert response.status_code == 422

    def test_farmer_id_echoed_in_response(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert body["farmer_id"] == PLAN_PAYLOAD["farmer_id"]

    def test_farm_id_echoed_in_response(self, client):
        body = client.post("/api/rotation/plan", json=PLAN_PAYLOAD).json()
        assert body["farm_id"] == PLAN_PAYLOAD["farm_id"]


# ---------------------------------------------------------------------------
# GET /api/rotation/recommendations/{farmer_id}
# ---------------------------------------------------------------------------

class TestGetFarmerRecommendations:
    def test_returns_200_with_defaults(self, client):
        response = client.get("/api/rotation/recommendations/farmer_abc")
        assert response.status_code == 200

    def test_default_plan_years_is_3(self, client):
        body = client.get("/api/rotation/recommendations/farmer_abc").json()
        assert len(body["rotation_plan"]) == 3

    def test_custom_plan_years(self, client):
        body = client.get("/api/rotation/recommendations/f1?plan_years=4").json()
        assert len(body["rotation_plan"]) == 4

    def test_farmer_id_in_response(self, client):
        body = client.get("/api/rotation/recommendations/farmer_xyz").json()
        assert body["farmer_id"] == "farmer_xyz"

    def test_custom_nutrients_accepted(self, client):
        response = client.get(
            "/api/rotation/recommendations/f2"
            "?nitrogen=20&phosphorus=10&potassium=15&organic_matter=1.0"
        )
        assert response.status_code == 200

    def test_invalid_nitrogen_returns_422(self, client):
        response = client.get("/api/rotation/recommendations/f3?nitrogen=-10")
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# POST /api/rotation/analyze
# ---------------------------------------------------------------------------

class TestAnalyzeSoilHealth:
    def test_returns_200_with_valid_payload(self, client):
        response = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD)
        assert response.status_code == 200

    def test_soil_health_score_present(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        score = body["soil_health_score"]
        assert "overall_score" in score
        assert 0 <= score["overall_score"] <= 100

    def test_health_status_is_string(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        assert isinstance(body["soil_health_score"]["health_status"], str)

    def test_nutrient_trends_length_matches_nutrients(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        # Expect 4 trends: N, P, K, organic matter
        assert len(body["nutrient_trends"]) == 4

    def test_degradation_risk_is_known_level(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        assert body["degradation_risk"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")

    def test_poor_soil_has_high_degradation_risk(self, client):
        payload = dict(ANALYZE_PAYLOAD, current_nutrients=POOR_NUTRIENTS)
        body = client.post("/api/rotation/analyze", json=payload).json()
        assert body["degradation_risk"] in ("HIGH", "CRITICAL")

    def test_healthy_soil_has_low_degradation_risk(self, client):
        good_nutrients = {
            "nitrogen": 65.0,
            "phosphorus": 32.0,
            "potassium": 48.0,
            "organic_matter": 3.5,
        }
        payload = dict(ANALYZE_PAYLOAD, current_nutrients=good_nutrients)
        body = client.post("/api/rotation/analyze", json=payload).json()
        assert body["degradation_risk"] in ("LOW", "MEDIUM")

    def test_depletion_warnings_is_list(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        assert isinstance(body["depletion_warnings"], list)

    def test_improvement_actions_not_empty(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        assert len(body["improvement_actions"]) > 0

    def test_farm_id_echoed(self, client):
        body = client.post("/api/rotation/analyze", json=ANALYZE_PAYLOAD).json()
        assert body["farm_id"] == ANALYZE_PAYLOAD["farm_id"]

    def test_empty_crop_history_accepted(self, client):
        payload = dict(ANALYZE_PAYLOAD, crop_history=[])
        response = client.post("/api/rotation/analyze", json=payload)
        assert response.status_code == 200

    def test_poor_nutrients_trigger_warnings(self, client):
        payload = dict(ANALYZE_PAYLOAD, current_nutrients=POOR_NUTRIENTS, crop_history=[])
        body = client.post("/api/rotation/analyze", json=payload).json()
        assert len(body["depletion_warnings"]) > 0


# ---------------------------------------------------------------------------
# GET /api/rotation/history/{farm_id}
# ---------------------------------------------------------------------------

class TestGetFarmHistory:
    def test_returns_200_without_crop_param(self, client):
        response = client.get("/api/rotation/history/farm_001")
        assert response.status_code == 200

    def test_empty_history_returns_zero_avg(self, client):
        body = client.get("/api/rotation/history/farm_001").json()
        assert body["avg_soil_health_score"] == 0.0
        assert body["crop_history"] == []

    def test_returns_200_with_crops_param(self, client):
        response = client.get("/api/rotation/history/farm_002?crops=Rice,Wheat,Maize")
        assert response.status_code == 200

    def test_crop_history_count_matches_input(self, client):
        body = client.get("/api/rotation/history/farm_002?crops=Rice,Wheat,Maize").json()
        assert len(body["crop_history"]) == 3

    def test_crop_history_years_ordered(self, client):
        body = client.get("/api/rotation/history/farm_002?crops=Rice,Wheat").json()
        years = [entry["year"] for entry in body["crop_history"]]
        assert years == [1, 2]

    def test_avg_soil_health_in_valid_range(self, client):
        body = client.get("/api/rotation/history/farm_002?crops=Rice,Wheat,Maize").json()
        assert 0 <= body["avg_soil_health_score"] <= 100

    def test_trend_summary_is_string(self, client):
        body = client.get("/api/rotation/history/farm_002?crops=Rice,Wheat").json()
        assert isinstance(body["soil_trend_summary"], str)

    def test_farm_id_echoed(self, client):
        body = client.get("/api/rotation/history/my_farm").json()
        assert body["farm_id"] == "my_farm"

    def test_single_crop_history(self, client):
        body = client.get("/api/rotation/history/f1?crops=Rice").json()
        assert len(body["crop_history"]) == 1
        assert body["crop_history"][0]["crop"] == "Rice"


# ---------------------------------------------------------------------------
# POST /api/rotation/optimize
# ---------------------------------------------------------------------------

class TestOptimizeExistingPlan:
    def test_returns_200_with_valid_payload(self, client):
        response = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD)
        assert response.status_code == 200

    def test_original_plan_echoed(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert body["original_plan"] == OPTIMIZE_PAYLOAD["existing_plan"]

    def test_optimized_plan_same_length_as_original(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert len(body["optimized_plan"]) == len(OPTIMIZE_PAYLOAD["existing_plan"])

    def test_profitability_improvement_is_numeric(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert isinstance(body["profitability_improvement"], (int, float))

    def test_soil_health_improvement_is_numeric(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert isinstance(body["soil_health_improvement"], (int, float))

    def test_optimization_notes_not_empty(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert len(body["optimization_notes"]) > 0

    def test_empty_existing_plan_returns_422(self, client):
        payload = dict(OPTIMIZE_PAYLOAD, existing_plan=[])
        response = client.post("/api/rotation/optimize", json=payload)
        assert response.status_code == 422

    def test_custom_market_prices_accepted(self, client):
        payload = dict(OPTIMIZE_PAYLOAD, market_prices={"Rice": 45000.0, "Wheat": 38000.0})
        response = client.post("/api/rotation/optimize", json=payload)
        assert response.status_code == 200

    def test_farmer_id_echoed(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert body["farmer_id"] == OPTIMIZE_PAYLOAD["farmer_id"]

    def test_farm_id_echoed(self, client):
        body = client.post("/api/rotation/optimize", json=OPTIMIZE_PAYLOAD).json()
        assert body["farm_id"] == OPTIMIZE_PAYLOAD["farm_id"]


# ---------------------------------------------------------------------------
# Engine unit tests (rotation_engine module directly)
# ---------------------------------------------------------------------------

class TestRotationEngine:
    def test_calculate_soil_health_ideal_values(self):
        from app.engines.rotation_engine import calculate_soil_health
        result = calculate_soil_health(60.0, 30.0, 45.0, 3.0)
        assert result["overall_score"] == 100.0
        assert result["health_status"] == "Excellent"

    def test_calculate_soil_health_poor_values(self):
        from app.engines.rotation_engine import calculate_soil_health
        result = calculate_soil_health(5.0, 2.0, 3.0, 0.3)
        assert result["overall_score"] < 35
        assert result["health_status"] == "Poor"

    def test_soil_health_score_within_bounds(self):
        from app.engines.rotation_engine import calculate_soil_health
        result = calculate_soil_health(200.0, 200.0, 200.0, 20.0)
        assert 0 <= result["overall_score"] <= 100

    def test_genetic_algorithm_returns_correct_length(self):
        from app.engines.rotation_engine import run_genetic_algorithm
        nutrients = {"nitrogen": 50, "phosphorus": 25, "potassium": 40, "organic_matter": 2.5}
        seq = run_genetic_algorithm(nutrients, plan_years=3, seed=1)
        assert len(seq) == 3

    def test_genetic_algorithm_returns_known_crops(self):
        from app.engines.rotation_engine import ALL_CROPS, run_genetic_algorithm
        nutrients = {"nitrogen": 50, "phosphorus": 25, "potassium": 40, "organic_matter": 2.5}
        seq = run_genetic_algorithm(nutrients, plan_years=4, seed=2)
        for crop in seq:
            assert crop in ALL_CROPS

    def test_build_rotation_plan_structure(self):
        from app.engines.rotation_engine import build_rotation_plan
        nutrients = {"nitrogen": 55, "phosphorus": 28, "potassium": 42, "organic_matter": 2.8}
        result = build_rotation_plan("f1", "farm1", nutrients, 3, True, "Rice")
        assert "rotation_plan" in result
        assert result["plan_years"] == 3
        assert "soil_health_before" in result
        assert "soil_health_after" in result

    def test_analyze_soil_returns_expected_keys(self):
        from app.engines.rotation_engine import analyze_soil
        nutrients = {"nitrogen": 30, "phosphorus": 15, "potassium": 20, "organic_matter": 1.0}
        result = analyze_soil("farm_test", "Alluvial", nutrients, ["Rice", "Wheat"])
        assert "soil_health_score" in result
        assert "nutrient_trends" in result
        assert "degradation_risk" in result
        assert len(result["nutrient_trends"]) == 4
