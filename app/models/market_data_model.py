"""
Market Data model
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class MarketData(Base):
    """Market data model"""
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True)
    crop = Column(String, index=True)
    price = Column(Float)
    market = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
