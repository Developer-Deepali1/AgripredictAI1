"""Farmer profile request and response schemas."""
from typing import List

from pydantic import BaseModel, Field


class FarmerProfileBase(BaseModel):
    """Common fields for farmer profile."""

    name: str = Field(min_length=1, max_length=120)
    location: str = Field(min_length=1, max_length=200)
    land_size: float = Field(gt=0)
    soil_type: str = Field(min_length=1, max_length=100)
    crop_history: List[str] = Field(default_factory=list)


class FarmerProfileCreate(FarmerProfileBase):
    """Create profile schema."""


class FarmerProfileUpdate(BaseModel):
    """Partial update profile schema."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    location: str | None = Field(default=None, min_length=1, max_length=200)
    land_size: float | None = Field(default=None, gt=0)
    soil_type: str | None = Field(default=None, min_length=1, max_length=100)
    crop_history: List[str] | None = None


class FarmerProfileResponse(FarmerProfileBase):
    """Profile response schema."""

    id: int
    user_id: int

    class Config:
        from_attributes = True
