"""
Farmer Profile API endpoints
"""
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db import get_db
from app.models.user_model import User
from app.schemas.farmer_profile_schema import (
    FarmerProfileCreate,
    FarmerProfileResponse,
    FarmerProfileUpdate,
)
from app.services.profile_service import ProfileService

router = APIRouter()


@router.post("", response_model=FarmerProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: FarmerProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FarmerProfileResponse:
    """Create farmer profile for authenticated user."""
    service = ProfileService(db)
    profile = service.create_for_user(current_user, payload)
    return FarmerProfileResponse.model_validate(profile)


@router.get("", response_model=FarmerProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FarmerProfileResponse:
    """Get current user's farmer profile."""
    service = ProfileService(db)
    profile = service.get_by_user(current_user.id)
    return FarmerProfileResponse.model_validate(profile)


@router.put("", response_model=FarmerProfileResponse)
def update_profile(
    payload: FarmerProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FarmerProfileResponse:
    """Update current user's farmer profile."""
    service = ProfileService(db)
    profile = service.update_for_user(current_user.id, payload)
    return FarmerProfileResponse.model_validate(profile)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Response:
    """Delete current user's farmer profile."""
    service = ProfileService(db)
    service.delete_for_user(current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
