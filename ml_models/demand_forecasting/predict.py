from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import joblib
import pandas as pd


model_path = Path("ml_models/demand_forecast/demand_model.pkl")
REQUIRED_FIELDS = (
	"crop",
	"state",
	"year",
	"month_num",
	"prev_price",
	"price_diff",
)
CATEGORICAL_FIELDS = ("crop", "state")
NUMERIC_FIELDS = ("year", "month_num", "prev_price", "price_diff")


def load_model(model_path: Path = model_path):
	"""Load the trained demand forecasting model from disk."""
	if not model_path.exists():
		raise FileNotFoundError(
			f"Model file not found at '{model_path}'. "
			"Train and export the model before prediction."
		)

	try:
		return joblib.load(model_path)
	except Exception as exc:
		raise RuntimeError(f"Failed to load model from '{model_path}': {exc}") from exc


def _validate_and_normalize_input(input_data: dict) -> Dict[str, Any]:
	"""Validate incoming payload and normalize value types."""
	if not isinstance(input_data, dict):
		raise TypeError("input_data must be a dictionary.")

	missing_fields = [field for field in REQUIRED_FIELDS if field not in input_data]
	if missing_fields:
		raise ValueError(f"Missing required fields: {missing_fields}")

	normalized: Dict[str, Any] = {}

	for field in CATEGORICAL_FIELDS:
		value = input_data.get(field)
		if value is None:
			raise ValueError(f"Field '{field}' cannot be null.")
		normalized[field] = str(value).strip()
		if not normalized[field]:
			raise ValueError(f"Field '{field}' cannot be empty.")

	for field in NUMERIC_FIELDS:
		value = input_data.get(field)
		if value is None:
			raise ValueError(f"Field '{field}' cannot be null.")

		try:
			if field in ("year", "month_num"):
				normalized[field] = int(value)
			else:
				normalized[field] = float(value)
		except (TypeError, ValueError) as exc:
			expected = "integer" if field in ("year", "month_num") else "number"
			raise TypeError(f"Field '{field}' must be a valid {expected}.") from exc

	if not 1 <= normalized["month_num"] <= 12:
		raise ValueError("Field 'month_num' must be between 1 and 12.")

	return normalized


def _build_feature_frame(normalized_data: Dict[str, Any]) -> pd.DataFrame:
	"""Create a single-row DataFrame with training-time feature columns."""
	return pd.DataFrame([normalized_data], columns=list(REQUIRED_FIELDS))


def _predict_label(model: Any, feature_frame: pd.DataFrame) -> str:
	"""Run model prediction and return a single demand label."""
	try:
		predictions = model.predict(feature_frame)
	except Exception as exc:
		raise RuntimeError(f"Model prediction failed: {exc}") from exc

	if len(predictions) == 0:
		raise RuntimeError("Model returned no prediction output.")

	return str(predictions[0])


def predict_demand(input_data: dict) -> dict:
	"""Predict demand class (High/Medium/Low) from input features.

	Args:
		input_data: Payload containing required demand features.

	Returns:
		Dictionary containing predicted demand and normalized input features.
	"""
	normalized_data = _validate_and_normalize_input(input_data)
	feature_frame = _build_feature_frame(normalized_data)
	model = load_model()
	predicted_demand = _predict_label(model, feature_frame)

	return {
		"predicted_demand": predicted_demand,
		"input_features": normalized_data,
	}


def _example_payload() -> Dict[str, Any]:
	return {
		"crop": "Maize",
		"state": "Odisha",
		"year": 2025,
		"month_num": 4,
		"prev_price": 2300,
		"price_diff": 300,
	}


if __name__ == "__main__":
	sample_input = _example_payload()

	try:
		result = predict_demand(sample_input)
		print("Prediction Result:")
		print(result)
	except (FileNotFoundError, ValueError, TypeError, RuntimeError) as exc:
		print(f"Prediction failed: {exc}")
