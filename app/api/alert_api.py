"""
Alert Management API endpoints
"""
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, status

from app.schemas.alert_schema import Alert, AlertSettingsRequest, AlertSettingsResponse

router = APIRouter()

_BASE_DATE = datetime(2024, 6, 1, 9, 0, 0)

_ACTIVE_ALERTS: List[Alert] = [
    Alert(id=1, alert_type="PRICE_DROP", crop="Tomato",
          message="Tomato prices have dropped 18% in last 7 days at Nasik APMC. Consider delaying harvest.",
          severity="HIGH", created_at=(_BASE_DATE - timedelta(hours=3)).isoformat(), is_active=True),
    Alert(id=2, alert_type="WEATHER_WARNING", crop=None,
          message="IMD forecast: Heavy rainfall expected in Vidarbha region over next 48 hours. Protect standing crops.",
          severity="HIGH", created_at=(_BASE_DATE - timedelta(hours=6)).isoformat(), is_active=True),
    Alert(id=3, alert_type="PRICE_SPIKE", crop="Onion",
          message="Onion prices have surged 25% at Delhi Azadpur mandi due to supply shortage.",
          severity="MEDIUM", created_at=(_BASE_DATE - timedelta(hours=12)).isoformat(), is_active=True),
    Alert(id=4, alert_type="DISEASE_RISK", crop="Wheat",
          message="Yellow rust disease alert in Punjab. Apply propiconazole fungicide within 7 days.",
          severity="HIGH", created_at=(_BASE_DATE - timedelta(hours=18)).isoformat(), is_active=True),
    Alert(id=5, alert_type="MARKET_ALERT", crop="Cotton",
          message="CCI begins procurement at MSP ₹6620/quintal. Register at nearest CCI centre.",
          severity="LOW", created_at=(_BASE_DATE - timedelta(hours=24)).isoformat(), is_active=True),
]

_ALERT_HISTORY: List[Alert] = [
    Alert(id=6, alert_type="PRICE_DROP", crop="Potato",
          message="Potato prices fell 30% in Agra mandis due to bumper harvest. Cold storage recommended.",
          severity="HIGH", created_at=(_BASE_DATE - timedelta(days=3)).isoformat(), is_active=False),
    Alert(id=7, alert_type="WEATHER_WARNING", crop=None,
          message="Cyclone warning for coastal Andhra Pradesh. Harvest standing paddy crops immediately.",
          severity="CRITICAL", created_at=(_BASE_DATE - timedelta(days=5)).isoformat(), is_active=False),
    Alert(id=8, alert_type="PRICE_SPIKE", crop="Tomato",
          message="Tomato prices hit ₹80/kg at Bangalore due to crop failure in Karnataka.",
          severity="MEDIUM", created_at=(_BASE_DATE - timedelta(days=7)).isoformat(), is_active=False),
    Alert(id=9, alert_type="DISEASE_RISK", crop="Rice",
          message="Blast disease outbreak in West Bengal paddy fields. Apply carbendazim spray.",
          severity="HIGH", created_at=(_BASE_DATE - timedelta(days=10)).isoformat(), is_active=False),
    Alert(id=10, alert_type="MARKET_ALERT", crop="Wheat",
          message="FCI wheat procurement begins at MSP ₹2275/quintal in Punjab from April 1.",
          severity="LOW", created_at=(_BASE_DATE - timedelta(days=14)).isoformat(), is_active=False),
]


@router.get("/", response_model=List[Alert])
def get_active_alerts() -> List[Alert]:
    """Return all currently active alerts sorted by severity and creation time."""
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    return sorted(_ACTIVE_ALERTS, key=lambda a: severity_order.get(a.severity, 4))


@router.get("/history", response_model=List[Alert])
def get_alert_history() -> List[Alert]:
    """Return historical (resolved) alerts."""
    return _ALERT_HISTORY


@router.put("/settings", response_model=AlertSettingsResponse, status_code=status.HTTP_200_OK)
def update_alert_settings(payload: AlertSettingsRequest) -> AlertSettingsResponse:
    """Update user alert notification preferences and thresholds."""
    return AlertSettingsResponse(
        message="Alert settings updated successfully.",
        settings=payload,
    )
