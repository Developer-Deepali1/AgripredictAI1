"""
Unit tests for Crop Disease Detection & Grad-CAM API (/api/disease)
"""
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.db import get_db, engine
from app.models import Base


client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    """Ensure tables are created before each test."""
    Base.metadata.create_all(bind=engine)
    yield


def _create_test_image_bytes(color=(34, 139, 34), width=100, height=100) -> bytes:
    """Generate a synthetic in-memory JPEG leaf image."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_get_supported_crops():
    """Verify endpoint returns supported crops and detectable diseases."""
    resp = client.get("/api/disease/crops")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    crops = [item["crop"] for item in data]
    assert "Rice" in crops
    assert "Wheat" in crops
    assert "Corn" in crops
    assert "Potato" in crops


def test_predict_crop_disease_rice():
    """Test leaf image diagnosis with Grad-CAM generation for Rice."""
    img_bytes = _create_test_image_bytes(color=(120, 160, 40))
    files = {"file": ("leaf.jpg", img_bytes, "image/jpeg")}
    data = {"crop": "Rice"}

    resp = client.post("/api/disease/predict", files=files, data=data)
    assert resp.status_code == 200
    res = resp.json()

    assert res["crop"] == "Rice"
    assert "predicted_disease" in res
    assert 0.0 <= res["confidence"] <= 1.0
    assert "probabilities" in res
    assert len(res["probabilities"]) >= 4

    # Verify Grad-CAM base64 data URI was generated
    assert res["gradcam_image"] is not None
    assert res["gradcam_image"].startswith("data:image/jpeg;base64,")

    # Verify organic treatment advice is attached
    assert "treatment" in res
    assert "organic_remedy" in res["treatment"]
    assert len(res["treatment"]["organic_remedy"]) > 10
    assert "chemical_backup" in res["treatment"]
    assert "prevention_tips" in res["treatment"]
    assert isinstance(res["treatment"]["prevention_tips"], list)
    assert res["prediction_id"] is not None


def test_predict_disease_wheat():
    """Test leaf image diagnosis for Wheat."""
    img_bytes = _create_test_image_bytes(color=(180, 150, 30))
    files = {"file": ("wheat_leaf.png", img_bytes, "image/png")}
    data = {"crop": "Wheat"}

    resp = client.post("/api/disease/predict", files=files, data=data)
    assert resp.status_code == 200
    res = resp.json()
    assert res["crop"] == "Wheat"
    assert res["gradcam_image"].startswith("data:image/jpeg;base64,")


def test_predict_invalid_image_type():
    """Verify rejection of non-image file uploads."""
    files = {"file": ("malicious.txt", b"not an image", "text/plain")}
    resp = client.post("/api/disease/predict", files=files)
    assert resp.status_code in (415, 422)


def test_submit_diagnosis_feedback_and_history():
    """Test farmer feedback submission and history audit trail."""
    # 1. First run a diagnosis
    img_bytes = _create_test_image_bytes()
    files = {"file": ("leaf.jpg", img_bytes, "image/jpeg")}
    diag_resp = client.post("/api/disease/predict", files=files, data={"crop": "Potato"})
    assert diag_resp.status_code == 200
    pred_id = diag_resp.json()["prediction_id"]

    # 2. Submit feedback
    feedback_payload = {
        "prediction_id": pred_id,
        "feedback": "CORRECT",
        "notes": "Confirmed by local Krishi Vigyan Kendra extension officer."
    }
    fb_resp = client.post("/api/disease/feedback", json=feedback_payload)
    assert fb_resp.status_code == 200
    assert fb_resp.json()["status"] == "success"

    # 3. Retrieve history and check record
    hist_resp = client.get("/api/disease/history")
    assert hist_resp.status_code == 200
    hist = hist_resp.json()
    assert len(hist) >= 1
    matched = next((h for h in hist if h["id"] == pred_id), None)
    assert matched is not None
    assert matched["feedback"] == "CORRECT"


def test_get_leaf_samples():
    """Verify curated authentic leaf samples endpoint."""
    resp = client.get("/api/disease/samples")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 7
    ids = [s["id"] for s in data]
    assert "rice_blast" in ids
    assert "tomato_early_blight" in ids
    assert "cotton_bacterial_blight" in ids


def test_predict_disease_tomato_and_cotton():
    """Verify Tomato and Cotton pathology detection and severity fields."""
    img_bytes = _create_test_image_bytes(color=(140, 110, 35))
    
    # Test Tomato
    resp_tom = client.post("/api/disease/predict", files={"file": ("tomato.jpg", img_bytes, "image/jpeg")}, data={"crop": "Tomato"})
    assert resp_tom.status_code == 200
    data_tom = resp_tom.json()
    assert data_tom["crop"] == "Tomato"
    assert "severity_grade" in data_tom
    assert "affected_area_pct" in data_tom
    assert "urgency" in data_tom

    # Test Cotton
    resp_cot = client.post("/api/disease/predict", files={"file": ("cotton.jpg", img_bytes, "image/jpeg")}, data={"crop": "Cotton"})
    assert resp_cot.status_code == 200
    data_cot = resp_cot.json()
    assert data_cot["crop"] == "Cotton"
    assert data_cot["severity_grade"] in ("HEALTHY", "MILD", "MODERATE", "SEVERE")

