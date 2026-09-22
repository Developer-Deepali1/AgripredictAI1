"""
Disease Prediction ORM Model
Stores leaf disease detection records, Grad-CAM heatmap data, and farmer feedback.
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.models.base import Base


class DiseasePrediction(Base):
    """Stores leaf disease detection records with active learning feedback."""

    __tablename__ = "disease_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    image_hash = Column(String(64), index=True, nullable=True)
    crop = Column(String(50), index=True, nullable=False)
    predicted_disease = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    gradcam_image = Column(Text, nullable=True)  # Base64 encoded heatmap overlay
    treatment_summary = Column(Text, nullable=True)
    feedback = Column(String(20), nullable=True)  # "CORRECT", "INCORRECT"
    user_notes = Column(Text, nullable=True)
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<DiseasePrediction id={self.id} crop={self.crop!r} "
            f"disease={self.predicted_disease!r} conf={self.confidence:.2f}>"
        )
