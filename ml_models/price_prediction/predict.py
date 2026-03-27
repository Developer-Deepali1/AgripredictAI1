"""Production-ready inference utilities for crop price prediction."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Any, Dict

import joblib
import pandas as pd


DEFAULT_MODEL_PATH = Path("ml_models/price_prediction/model.pkl")


class ModelLoadError(RuntimeError):
    """Raised when a trained pipeline cannot be loaded safely."""


class PredictionInputError(ValueError):
    """Raised when prediction input payload is invalid."""


def _resolve_model_path(model_path: str | Path = DEFAULT_MODEL_PATH) -> Path:
    """Resolve model path with case-insensitive fallbacks for Windows projects."""
    requested = Path(model_path)
    candidates = [requested, DEFAULT_MODEL_PATH, Path("ml_models/price_prediction/model.pkl")]

    seen = set()
    unique_candidates = []
    for candidate in candidates:
        candidate_str = str(candidate)
        if candidate_str not in seen:
            seen.add(candidate_str)
            unique_candidates.append(candidate)

    for candidate in unique_candidates:
        if candidate.exists():
            return candidate

    checked = ", ".join(str(path) for path in unique_candidates)
    raise FileNotFoundError(f"Model file not found. Checked: {checked}")


def load_model(model_path: str | Path = DEFAULT_MODEL_PATH):
    """Load the full trained pipeline from disk."""
    resolved_path = _resolve_model_path(model_path)

    try:
        model = joblib.load(resolved_path)
    except Exception as exc:
        raise ModelLoadError(f"Failed to load model from {resolved_path}: {exc}") from exc

    if not hasattr(model, "predict"):
        raise ModelLoadError("Loaded artifact is not a valid prediction pipeline (missing 'predict').")

    return model


def _normalize_and_validate_features(features: Dict[str, Any]) -> Dict[str, Any]:
    """Validate incoming payload and normalize it into model-ready fields."""
    if not isinstance(features, dict):
        raise PredictionInputError("Features must be a dictionary.")

    required_keys = ["crop", "state", "month", "prev_price"]
    missing = [key for key in required_keys if key not in features]
    if missing:
        raise PredictionInputError(f"Missing required feature(s): {', '.join(missing)}")

    crop = str(features["crop"]).strip()
    state = str(features["state"]).strip()
    if not crop:
        raise PredictionInputError("'crop' cannot be empty.")
    if not state:
        raise PredictionInputError("'state' cannot be empty.")

    try:
        prev_price = float(features["prev_price"])
    except (TypeError, ValueError) as exc:
        raise PredictionInputError("'prev_price' must be a numeric value.") from exc

    month_raw = features["month"]
    month = pd.to_datetime(month_raw, errors="coerce", dayfirst=True)
    if pd.isna(month):
        raise PredictionInputError(
            "Invalid 'month' value. Provide a valid date like '01-04-2025' or '2025-04-01'."
        )

    return {
        "crop": crop,
        "state": state,
        "month": month,
        "year": int(month.year),
        "month_num": int(month.month),
        "prev_price": prev_price,
    }


def _build_feature_frame(features: Dict[str, Any]) -> pd.DataFrame:
    """Convert validated feature payload into the exact training schema."""
    normalized = _normalize_and_validate_features(features)
    return pd.DataFrame(
        [
            {
                "crop": normalized["crop"],
                "state": normalized["state"],
                "year": normalized["year"],
                "month_num": normalized["month_num"],
                "prev_price": normalized["prev_price"],
            }
        ]
    )


def get_prediction_confidence(model, features):
    """Estimate prediction confidence for RandomForest-based pipelines.

    Returns a dictionary with a score (0-100) and uncertainty details.
    """
    X = _build_feature_frame(features)

    pipeline_model = getattr(model, "named_steps", {}).get("model")
    preprocessor = getattr(model, "named_steps", {}).get("preprocessor")
    if pipeline_model is None or preprocessor is None or not hasattr(pipeline_model, "estimators_"):
        return {
            "confidence_score": None,
            "prediction_std": None,
            "note": "Confidence estimation unavailable for this model type.",
        }

    transformed = preprocessor.transform(X)
    tree_predictions = [float(est.predict(transformed)[0]) for est in pipeline_model.estimators_]

    mean_prediction = sum(tree_predictions) / len(tree_predictions)
    variance = sum((pred - mean_prediction) ** 2 for pred in tree_predictions) / len(tree_predictions)
    prediction_std = math.sqrt(variance)

    denominator = max(abs(mean_prediction), 1e-9)
    coefficient_of_variation = prediction_std / denominator
    confidence_score = max(0.0, min(100.0, 100.0 / (1.0 + coefficient_of_variation * 10.0)))

    interval_delta = 1.96 * prediction_std
    return {
        "confidence_score": round(confidence_score, 2),
        "prediction_std": round(prediction_std, 4),
        "lower_95": round(mean_prediction - interval_delta, 4),
        "upper_95": round(mean_prediction + interval_delta, 4),
    }


def predict_price(model, features):
    """Predict crop price from structured input payload.

    Input keys:
    - crop: str
    - state: str
    - month: date-like string
    - prev_price: float
    """
    X = _build_feature_frame(features)

    try:
        predicted_price = float(model.predict(X)[0])
    except Exception as exc:
        raise RuntimeError(f"Prediction failed: {exc}") from exc

    confidence = get_prediction_confidence(model, features)
    result = {
        "predicted_price": round(predicted_price, 4),
        "input_features": {
            "crop": X.iloc[0]["crop"],
            "state": X.iloc[0]["state"],
            "year": int(X.iloc[0]["year"]),
            "month_num": int(X.iloc[0]["month_num"]),
            "prev_price": float(X.iloc[0]["prev_price"]),
        },
        "confidence": confidence,
    }
    return result


def main() -> None:
    """Quick local smoke test entrypoint for manual verification."""
    model = load_model()
    sample_features = {
        "crop": "Maize",
        "state": "India",
        "month": "01-04-2025",
        "prev_price": 2341.58,
    }
    output = predict_price(model, sample_features)
    print(output)


if __name__ == "__main__":
    main()
