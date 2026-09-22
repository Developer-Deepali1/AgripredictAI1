"""
Crop Disease Detection & Grad-CAM Explainability API
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.engines.disease_engine import diagnose_leaf
from app.models.disease_prediction import DiseasePrediction
from app.schemas.disease_schema import (
    DiseaseFeedbackRequest,
    DiseaseFeedbackResponse,
    DiseaseHistoryItem,
    DiseasePredictionResponse,
    SupportedCropDisease,
)
from app.services.treatment_service import list_supported_crops_and_diseases

router = APIRouter()
logger = logging.getLogger("disease_api")

_ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp",
    "application/octet-stream",
}


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    summary="Diagnose crop disease from leaf image with Grad-CAM heatmap",
)
async def predict_crop_disease(
    file: UploadFile = File(..., description="Leaf image file (JPG, PNG, WEBP)"),
    crop: Optional[str] = Form(None, description="Optional crop hint (Rice, Wheat, Corn, Potato)"),
    db: Session = Depends(get_db),
) -> DiseasePredictionResponse:
    """
    Accept leaf image upload, run Computer Vision classification,
    generate visual Grad-CAM heatmap overlay, and persist record for farmer feedback.
    """
    if file.content_type and file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Please upload a JPEG or PNG image.",
        )

    try:
        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) < 100:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Empty or corrupted image file uploaded.",
            )
    except Exception as exc:
        logger.exception("Error reading uploaded image: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded image.",
        ) from exc

    try:
        diagnosis = diagnose_leaf(image_bytes=image_bytes, requested_crop=crop)
    except Exception as exc:
        logger.exception("Diagnosis engine failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing leaf image diagnosis. Please ensure image is a clear leaf photo.",
        ) from exc

    # Persist to database audit log
    record = DiseasePrediction(
        image_hash=diagnosis["image_hash"],
        crop=diagnosis["crop"],
        predicted_disease=diagnosis["predicted_disease"],
        confidence=diagnosis["confidence"],
        gradcam_image=diagnosis["gradcam_image"],
        treatment_summary=diagnosis["treatment"].organic_remedy,
        feedback=None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return DiseasePredictionResponse(
        prediction_id=record.id,
        crop=diagnosis["crop"],
        predicted_disease=diagnosis["predicted_disease"],
        confidence=diagnosis["confidence"],
        probabilities=diagnosis["probabilities"],
        gradcam_image=diagnosis["gradcam_image"],
        image_hash=diagnosis["image_hash"],
        symptoms=diagnosis["symptoms"],
        cause=diagnosis["cause"],
        treatment=diagnosis["treatment"],
        is_healthy=diagnosis["is_healthy"],
        affected_area_pct=diagnosis.get("affected_area_pct", 0.0),
        severity_grade=diagnosis.get("severity_grade", "MILD"),
        urgency=diagnosis.get("urgency", "LOW"),
        weather_risk_note=diagnosis.get("weather_risk_note"),
    )


@router.post(
    "/feedback",
    response_model=DiseaseFeedbackResponse,
    summary="Submit accuracy feedback on leaf diagnosis",
)
def submit_diagnosis_feedback(
    payload: DiseaseFeedbackRequest,
    db: Session = Depends(get_db),
) -> DiseaseFeedbackResponse:
    """Record farmer verification or correction of AI diagnosis for model audit."""
    record = db.query(DiseasePrediction).filter(DiseasePrediction.id == payload.prediction_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID {payload.prediction_id} not found.",
        )

    feedback_norm = payload.feedback.upper()
    if feedback_norm not in ("CORRECT", "INCORRECT"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Feedback must be either 'CORRECT' or 'INCORRECT'.",
        )

    record.feedback = feedback_norm
    notes_list = []
    if payload.corrected_disease:
        notes_list.append(f"Corrected: {payload.corrected_disease}")
    if payload.notes:
        notes_list.append(payload.notes)
    if notes_list:
        record.user_notes = " | ".join(notes_list)

    db.commit()
    logger.info("Feedback recorded for prediction_id=%d: %s", payload.prediction_id, feedback_norm)

    return DiseaseFeedbackResponse(
        status="success",
        message="Thank you! Your feedback has been recorded to improve model accuracy.",
        prediction_id=payload.prediction_id,
    )


@router.get(
    "/history",
    response_model=List[DiseaseHistoryItem],
    summary="Retrieve recent diagnosis history",
)
def get_diagnosis_history(
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
) -> List[DiseaseHistoryItem]:
    """Return historical leaf disease predictions."""
    records = (
        db.query(DiseasePrediction)
        .order_by(DiseasePrediction.created_at.desc())
        .limit(limit)
        .all()
    )
    return records


@router.get(
    "/crops",
    response_model=List[SupportedCropDisease],
    summary="List supported crops and detectable pathologies",
)
def get_supported_diseases() -> List[SupportedCropDisease]:
    """Return catalog of crops and detectable diseases."""
    return list_supported_crops_and_diseases()


@router.get(
    "/samples",
    summary="Return curated authentic photographic leaf presets for field testing",
)
def get_leaf_samples():
    """Return list of realistic curated leaf samples."""
    return [
        {
            "id": "rice_blast",
            "label": "Rice Blast",
            "crop": "Rice",
            "pathogen": "Magnaporthe oryzae",
            "image_url": "/leaf_samples/rice_blast.jpg",
            "description": "Spindle-shaped necrotic lesions with grey centers on paddy leaf blade.",
            "severity_estimate": "MODERATE",
        },
        {
            "id": "wheat_yellow_rust",
            "label": "Wheat Stripe Rust",
            "crop": "Wheat",
            "pathogen": "Puccinia striiformis",
            "image_url": "/leaf_samples/wheat_rust.jpg",
            "description": "Bright yellow pustule stripes organized parallel to veins.",
            "severity_estimate": "SEVERE",
        },
        {
            "id": "corn_blight",
            "label": "Corn Leaf Blight",
            "crop": "Corn",
            "pathogen": "Exserohilum turcicum",
            "image_url": "/leaf_samples/corn_blight.jpg",
            "description": "Long elliptical tan lesions running length-wise on maize leaves.",
            "severity_estimate": "MODERATE",
        },
        {
            "id": "potato_late_blight",
            "label": "Potato Late Blight",
            "crop": "Potato",
            "pathogen": "Phytophthora infestans",
            "image_url": "/leaf_samples/potato_blight.jpg",
            "description": "Dark water-soaked necrotic patches with pale chlorotic margins.",
            "severity_estimate": "SEVERE",
        },
        {
            "id": "tomato_early_blight",
            "label": "Tomato Early Blight",
            "crop": "Tomato",
            "pathogen": "Alternaria solani",
            "image_url": "/leaf_samples/tomato_early_blight.jpg",
            "description": "Concentric target-board rings surrounded by yellow chlorotic halos.",
            "severity_estimate": "MODERATE",
        },
        {
            "id": "cotton_bacterial_blight",
            "label": "Cotton Angular Leaf Spot",
            "crop": "Cotton",
            "pathogen": "Xanthomonas citri",
            "image_url": "/leaf_samples/cotton_blight.jpg",
            "description": "Angular dark-brown water-soaked spots bounded by leaf veinlets.",
            "severity_estimate": "MILD",
        },
        {
            "id": "rice_healthy",
            "label": "Healthy Rice Leaf",
            "crop": "Rice",
            "pathogen": "None (Healthy)",
            "image_url": "/leaf_samples/healthy_rice.jpg",
            "description": "Clean, vibrant chlorophyll-rich upright rice leaf without lesions.",
            "severity_estimate": "HEALTHY",
        },
    ]
