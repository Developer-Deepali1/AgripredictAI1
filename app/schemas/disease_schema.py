"""
Disease Prediction & Treatment Pydantic Schemas
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TreatmentDetail(BaseModel):
    """Specific agronomic treatment advice."""
    organic_remedy: str = Field(..., description="First-line bio-agent or organic remedy")
    chemical_backup: str = Field(..., description="Safe chemical fallback if infection is severe")
    prevention_tips: List[str] = Field(default_factory=list, description="Cultural & farm hygiene practices")
    dosages: Optional[str] = Field(None, description="Recommended dilution and application schedule")


class DiseasePredictionResponse(BaseModel):
    """Leaf disease detection response with Grad-CAM visualization."""
    prediction_id: Optional[int] = Field(None, description="Database ID for submitting feedback")
    crop: str = Field(..., description="Crop name (Rice, Wheat, Corn, Potato, etc.)")
    predicted_disease: str = Field(..., description="Identified disease or 'Healthy'")
    confidence: float = Field(..., description="Classification confidence score (0-1)")
    probabilities: Dict[str, float] = Field(..., description="Class probability distribution")
    gradcam_image: Optional[str] = Field(None, description="Base64 data URI of Grad-CAM heatmap overlay")
    image_hash: Optional[str] = Field(None, description="SHA-256 hash of the uploaded image")
    symptoms: str = Field(..., description="Observed or typical visual symptoms")
    cause: str = Field(..., description="Primary pathogen or environmental trigger")
    treatment: TreatmentDetail = Field(..., description="Actionable treatment and prevention advice")
    is_healthy: bool = Field(default=False, description="True if plant shows no disease pathology")
    affected_area_pct: float = Field(default=0.0, description="Estimated percentage of leaf surface affected by lesions")
    severity_grade: str = Field(default="MILD", description="Disease severity: MILD, MODERATE, or SEVERE")
    urgency: str = Field(default="LOW", description="Urgency of treatment: HIGH, MEDIUM, or LOW")
    weather_risk_note: Optional[str] = Field(None, description="Agronomic correlation with ambient temperature/humidity")
    ai_engine: Optional[str] = Field(default="Computer Vision + GradCAM", description="Diagnostic model or ensemble engine")


class DiseaseFeedbackRequest(BaseModel):
    """User feedback for active learning and model audit."""
    prediction_id: int = Field(..., description="ID of the prediction to provide feedback on")
    feedback: str = Field(..., description="'CORRECT' or 'INCORRECT'")
    corrected_disease: Optional[str] = Field(None, description="If incorrect, what disease it actually was")
    notes: Optional[str] = Field(None, description="Additional farmer observations or symptoms")


class DiseaseFeedbackResponse(BaseModel):
    """Response confirming feedback recording."""
    status: str
    message: str
    prediction_id: int


class DiseaseHistoryItem(BaseModel):
    """Audit log item for past leaf diagnoses."""
    id: int
    crop: str
    predicted_disease: str
    confidence: float
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SupportedCropDisease(BaseModel):
    """Supported crop and detectable pathologies."""
    crop: str
    diseases: List[str]
