"""
Crop model
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Crop(Base):
    """Crop model"""
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    growing_season = Column(String)
    ideal_temperature = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
