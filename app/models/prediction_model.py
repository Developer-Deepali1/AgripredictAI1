"""
Prediction model
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Prediction(Base):
    """Prediction model"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    crop = Column(String)
    predicted_price = Column(Float)
    confidence = Column(Float)
    prediction_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
