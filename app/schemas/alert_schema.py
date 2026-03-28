"""Alert Pydantic schemas"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Alert(BaseModel):
    id: int
    alert_type: str
    crop: Optional[str]
    message: str
    severity: str
    created_at: str
    is_active: bool

class AlertSettingsRequest(BaseModel):
    price_drop_threshold: float = 10.0
    price_spike_threshold: float = 20.0
    enable_weather_alerts: bool = True
    enable_disease_alerts: bool = True
    crops_to_monitor: List[str] = []

class AlertSettingsResponse(BaseModel):
    message: str
    settings: AlertSettingsRequest
