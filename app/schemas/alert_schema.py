"""Alert Pydantic schemas"""
from pydantic import BaseModel
from typing import Optional

class Alert(BaseModel):
    id: int
    alert_type: str
    crop: Optional[str]
    message: str
    severity: str
    created_at: str
    is_active: bool

class AlertSettingsRequest(BaseModel):
    price_drop: bool = True
    demand_spike: bool = True
    weather: bool = True
    email: bool = False

class AlertSettingsResponse(BaseModel):
    message: str
    settings: AlertSettingsRequest
