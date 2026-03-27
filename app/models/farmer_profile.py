"""
Farmer Profile model
"""
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import relationship

from app.models.base import Base


class FarmerProfile(Base):
    """Farmer profile model with one-to-one relationship to User"""
    __tablename__ = "farmer_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    land_size = Column(Float, nullable=False)
    soil_type = Column(String(255), nullable=False)
    crop_history = Column(JSON, nullable=False, default=list)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # One-to-one relationship with User
    user = relationship("User", back_populates="profile", uselist=False)
