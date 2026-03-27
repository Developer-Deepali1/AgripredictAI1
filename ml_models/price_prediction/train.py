"""Production training pipeline for crop price prediction."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Dict, Tuple

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


DEFAULT_DATA_PATH = Path("data/raw/crop_price_dataset.csv")
FALLBACK_DATA_PATH = Path("Data/raw/crop_price_dataset.csv")
ALT_DATA_PATH = Path("data/crop_price_dataset.csv")
ALT_FALLBACK_DATA_PATH = Path("Data/crop_price_dataset.csv")
DEFAULT_MODEL_PATH = Path("ml_models/price_prediction/model.pkl")


def _resolve_data_path(dataset_path: str | Path) -> Path:
    """Resolve dataset path with a case-insensitive fallback for Windows projects."""
    requested = Path(dataset_path)
    if requested.exists():
        return requested

    candidates = [
        requested,
        Path(str(dataset_path).replace("data/", "Data/")),
        DEFAULT_DATA_PATH,
        FALLBACK_DATA_PATH,
        ALT_DATA_PATH,
        ALT_FALLBACK_DATA_PATH,
    ]

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

    raise FileNotFoundError(
        f"Dataset file not found. Checked: {', '.join(str(p) for p in unique_candidates)}"
    )


def load_data(dataset_path: str | Path = DEFAULT_DATA_PATH) -> pd.DataFrame:
    """Load raw dataset and validate required columns."""
    file_path = _resolve_data_path(dataset_path)
    df = pd.read_csv(file_path)

    rename_map = {
        "avg_modal_price": "price",
        "commodity": "crop",
        "commodity_name": "crop",
        "state_name": "state",
    }
    df = df.rename(columns=rename_map)

    required_columns = {"month", "crop", "price", "state"}
    missing_columns = sorted(required_columns.difference(df.columns))
    if missing_columns:
        raise ValueError(
            f"Missing required columns in dataset: {', '.join(missing_columns)}"
        )

    print(f"Loaded dataset shape: {df.shape}")
    return df


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean data and generate model features."""
    working_df = df.copy()

    month_original = working_df["month"].copy()
    working_df["month"] = pd.to_datetime(
        working_df["month"],
        errors="coerce",
        dayfirst=True,
    )
    invalid_month_mask = month_original.notna() & working_df["month"].isna()
    invalid_count = int(invalid_month_mask.sum())
    if invalid_count > 0:
        raise ValueError(
            "Invalid date format found in 'month' column "
            f"for {invalid_count} row(s)."
        )

    working_df["price"] = pd.to_numeric(working_df["price"], errors="coerce")

    for column in ["crop", "state"]:
        working_df[column] = working_df[column].fillna("Unknown")

    # Drop rows with critical missing values before lag generation.
    working_df = working_df.dropna(subset=["month", "price", "crop", "state"])

    working_df = working_df.drop(columns=["district_name", "calculationType"], errors="ignore")
    working_df = working_df.sort_values(["crop", "month"]).reset_index(drop=True)

    working_df["year"] = working_df["month"].dt.year
    working_df["month_num"] = working_df["month"].dt.month
    working_df["prev_price"] = working_df.groupby("crop")["price"].shift(1)

    working_df = working_df.dropna(subset=["prev_price"]).reset_index(drop=True)
    return working_df


def _time_aware_split(df: pd.DataFrame, train_ratio: float = 0.8) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Split by chronological order to reduce leakage from future observations."""
    if df.empty:
        raise ValueError("No rows available after preprocessing.")

    sorted_df = df.sort_values("month").reset_index(drop=True)
    unique_months = sorted_df["month"].drop_duplicates().sort_values()

    if len(unique_months) < 2:
        raise ValueError("Not enough distinct months for a time-aware train-test split.")

    split_index = max(1, int(len(unique_months) * train_ratio))
    split_index = min(split_index, len(unique_months) - 1)
    split_month = unique_months.iloc[split_index - 1]

    train_df = sorted_df[sorted_df["month"] <= split_month].copy()
    test_df = sorted_df[sorted_df["month"] > split_month].copy()

    if train_df.empty or test_df.empty:
        row_split = int(len(sorted_df) * train_ratio)
        row_split = min(max(row_split, 1), len(sorted_df) - 1)
        train_df = sorted_df.iloc[:row_split].copy()
        test_df = sorted_df.iloc[row_split:].copy()

    return train_df, test_df


def train_model(df: pd.DataFrame) -> Tuple[Pipeline, pd.DataFrame, pd.Series]:
    """Train random forest model using a preprocessing + model pipeline."""
    train_df, test_df = _time_aware_split(df, train_ratio=0.8)

    feature_columns = ["crop", "state", "year", "month_num", "prev_price"]
    target_column = "price"

    X_train = train_df[feature_columns]
    y_train = train_df[target_column]
    X_test = test_df[feature_columns]
    y_test = test_df[target_column]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                ["crop", "state"],
            )
        ],
        remainder="passthrough",
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    pipeline.fit(X_train, y_train)
    print("Training completed successfully.")
    return pipeline, X_test, y_test


def evaluate_model(model_pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, float]:
    """Evaluate model and return MAE, RMSE, and R2."""
    predictions = model_pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    rmse = math.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    metrics = {"mae": mae, "rmse": rmse, "r2": r2}
    print("Evaluation metrics:")
    print(f"  MAE : {mae:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  R2  : {r2:.4f}")
    return metrics


def main(dataset_path: str | Path = DEFAULT_DATA_PATH, model_path: str | Path = DEFAULT_MODEL_PATH) -> None:
    """Run full training lifecycle: load, preprocess, train, evaluate, persist."""
    try:
        raw_df = load_data(dataset_path)
        processed_df = preprocess_data(raw_df)
        pipeline, X_test, y_test = train_model(processed_df)
        evaluate_model(pipeline, X_test, y_test)

        model_output_path = Path(model_path)
        model_output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, model_output_path)
        print(f"Saved trained pipeline to: {model_output_path}")

    except FileNotFoundError as exc:
        print(f"Error: {exc}")
        raise
    except ValueError as exc:
        print(f"Data validation error: {exc}")
        raise
    except Exception as exc:
        print(f"Unexpected training error: {exc}")
        raise


if __name__ == "__main__":
    main()
