"""Farmer profile business logic service."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.farmer_profile import FarmerProfile
from app.models.user_model import User
from app.schemas.farmer_profile_schema import FarmerProfileCreate, FarmerProfileUpdate


class ProfileService:
    """Service to handle profile CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int) -> FarmerProfile:
        profile = self.db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer profile not found",
            )
        return profile

    def create_for_user(self, user: User, payload: FarmerProfileCreate) -> FarmerProfile:
        existing_profile = self.db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User profile already exists",
            )

        profile = FarmerProfile(user_id=user.id, **payload.model_dump())
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_for_user(self, user_id: int, payload: FarmerProfileUpdate) -> FarmerProfile:
        profile = self.get_by_user(user_id)
        updates = payload.model_dump(exclude_unset=True)
        for field_name, field_value in updates.items():
            setattr(profile, field_name, field_value)

        self.db.commit()
        self.db.refresh(profile)
        return profile

    def delete_for_user(self, user_id: int) -> None:
        profile = self.get_by_user(user_id)
        self.db.delete(profile)
        self.db.commit()
