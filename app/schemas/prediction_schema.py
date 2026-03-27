"""
Prediction Pydantic schemas
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionRequest(BaseModel):
    """Prediction request schema"""
    crop: str
    days_ahead: int = 30

class PredictionResponse(BaseModel):
    """Prediction response schema"""
    crop: str
    predicted_price: float
    confidence: float
    prediction_date: datetime
    
    class Config:
        from_attributes = True
