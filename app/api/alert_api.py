"""
Alert Management API endpoints
"""
import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.alert_notification import AlertNotification
from app.schemas.alert_schema import (
    Alert,
    AlertSettingsRequest,
    AlertSettingsResponse,
    SendNotificationRequest,
    SendNotificationResponse,
    TestNotificationRequest,
)
from app.services.notification_service import send_email, send_sms
from app.core.logger import setup_logger

router = APIRouter()
logger = setup_logger("alert_api")

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
@router.get("/active", response_model=List[Alert])
def get_active_alerts() -> List[Alert]:
    """Return all currently active alerts sorted by severity and creation time."""
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    return sorted(_ACTIVE_ALERTS, key=lambda a: severity_order.get(a.severity, 4))


@router.post("/{alert_id}/dismiss", response_model=dict)
def dismiss_alert(alert_id: int):
    """Dismiss/acknowledge an active alert and move it to history."""
    global _ACTIVE_ALERTS, _ALERT_HISTORY
    found = None
    for a in _ACTIVE_ALERTS:
        if a.id == alert_id:
            found = a
            break
    if found:
        _ACTIVE_ALERTS = [a for a in _ACTIVE_ALERTS if a.id != alert_id]
        found.is_active = False
        _ALERT_HISTORY.insert(0, found)
        return {"status": "success", "message": f"Alert {alert_id} dismissed."}
    return {"status": "not_found", "message": f"Alert {alert_id} not found."}


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


# ---------------------------------------------------------------------------
# Helper: derive overall status from sms/email outcomes
# ---------------------------------------------------------------------------

def _overall_status(sms_status: str, email_status: str) -> str:
    """Return SUCCESS / PARTIAL / FAILED based on individual channel outcomes."""
    outcomes = {sms_status, email_status}
    if "failed" not in outcomes and "not_enabled" not in outcomes - {"not_enabled"}:
        # At least one channel was attempted
        attempted = [s for s in (sms_status, email_status) if s != "not_enabled"]
        if not attempted:
            return "FAILED"
        if all(s == "sent" for s in attempted):
            return "SUCCESS"
        if any(s == "sent" for s in attempted):
            return "PARTIAL"
        return "FAILED"
    # Simpler path
    attempted = [s for s in (sms_status, email_status) if s != "not_enabled"]
    if not attempted:
        return "FAILED"
    if all(s == "sent" for s in attempted):
        return "SUCCESS"
    if any(s == "sent" for s in attempted):
        return "PARTIAL"
    return "FAILED"


# ---------------------------------------------------------------------------
# POST /send  – dispatch real SMS / email for an alert
# ---------------------------------------------------------------------------

@router.post("/send", response_model=SendNotificationResponse, status_code=status.HTTP_200_OK)
def send_alert_notification(
    payload: SendNotificationRequest,
    db: Session = Depends(get_db),
) -> SendNotificationResponse:
    """
    Dispatch real SMS and/or email notification for an alert.

    • ``notify_sms=true``   → sends SMS via configured provider (Twilio / Fast2SMS)
    • ``notify_email=true`` → sends email via Gmail SMTP
    • Status is "SUCCESS" only when every enabled channel succeeds.
    • The attempt is recorded in the ``alert_notifications`` DB table.
    """
    now = datetime.now(timezone.utc)
    timestamp = now.isoformat()

    sms_result: Optional[dict] = None
    email_result: Optional[dict] = None
    sms_status = "not_enabled"
    email_status = "not_enabled"
    error_parts: List[str] = []

    # --- SMS ---
    if payload.notify_sms and payload.phone:
        logger.info(
            "Sending SMS for alert_id=%s user_id=%s phone=%s",
            payload.alert_id, payload.user_id, payload.phone,
        )
        sms_result = send_sms(payload.phone, payload.message)
        if sms_result.get("success"):
            sms_status = "sent"
        else:
            sms_status = "failed"
            error_parts.append(f"SMS error: {sms_result.get('error', 'unknown')}")
    elif payload.notify_sms and not payload.phone:
        sms_status = "failed"
        error_parts.append("SMS error: no phone number provided")

    # --- Email ---
    if payload.notify_email and payload.email:
        logger.info(
            "Sending email for alert_id=%s user_id=%s email=%s",
            payload.alert_id, payload.user_id, payload.email,
        )
        subject = "AgriPredictAI Alert Notification"
        email_result = send_email(payload.email, subject, payload.message)
        if email_result.get("success"):
            email_status = "sent"
        else:
            email_status = "failed"
            error_parts.append(f"Email error: {email_result.get('error', 'unknown')}")
    elif payload.notify_email and not payload.email:
        email_status = "failed"
        error_parts.append("Email error: no email address provided")

    overall = _overall_status(sms_status, email_status)
    error_details = "; ".join(error_parts) if error_parts else None

    # Persist audit record
    record = AlertNotification(
        alert_id=payload.alert_id,
        user_id=payload.user_id,
        phone=payload.phone,
        email=payload.email,
        message=payload.message,
        sms_status=sms_status,
        email_status=email_status,
        sms_response=json.dumps(sms_result) if sms_result is not None else None,
        email_response=json.dumps(email_result) if email_result is not None else None,
        error_message=error_details,
        sent_at=now,
    )
    db.add(record)
    db.commit()

    logger.info(
        "Notification result alert_id=%s overall=%s sms=%s email=%s",
        payload.alert_id, overall, sms_status, email_status,
    )

    return SendNotificationResponse(
        status=overall,
        sms_status=sms_status,
        email_status=email_status,
        sms_response=sms_result,
        email_response=email_result,
        error_details=error_details,
        timestamp=timestamp,
    )


# ---------------------------------------------------------------------------
# POST /test-notification  – quick smoke-test for SMS / email credentials
# ---------------------------------------------------------------------------

@router.post(
    "/test-notification",
    response_model=SendNotificationResponse,
    status_code=status.HTTP_200_OK,
)
def test_notification(payload: TestNotificationRequest) -> SendNotificationResponse:
    """
    Send a test SMS and/or email to verify that credentials are configured
    correctly.  No database record is written for test notifications.
    """
    now = datetime.now(timezone.utc)
    timestamp = now.isoformat()

    sms_result = None
    email_result = None
    sms_status = "not_enabled"
    email_status = "not_enabled"
    error_parts: List[str] = []

    if payload.notify_sms and payload.phone:
        sms_result = send_sms(payload.phone, payload.message)
        sms_status = "sent" if sms_result.get("success") else "failed"
        if not sms_result.get("success"):
            error_parts.append(f"SMS error: {sms_result.get('error', 'unknown')}")
    elif payload.notify_sms and not payload.phone:
        sms_status = "failed"
        error_parts.append("SMS error: no phone number provided")

    if payload.notify_email and payload.email:
        email_result = send_email(payload.email, "AgriPredictAI – Test Notification", payload.message)
        email_status = "sent" if email_result.get("success") else "failed"
        if not email_result.get("success"):
            error_parts.append(f"Email error: {email_result.get('error', 'unknown')}")
    elif payload.notify_email and not payload.email:
        email_status = "failed"
        error_parts.append("Email error: no email address provided")

    overall = _overall_status(sms_status, email_status)

    return SendNotificationResponse(
        status=overall,
        sms_status=sms_status,
        email_status=email_status,
        sms_response=sms_result,
        email_response=email_result,
        error_details="; ".join(error_parts) if error_parts else None,
        timestamp=timestamp,
    )
