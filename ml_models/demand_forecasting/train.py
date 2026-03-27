from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


REQUIRED_COLUMNS = {
	"crop",
	"state",
	"year",
	"month_num",
	"prev_price",
	"price_diff",
	"demand",
}

CATEGORICAL_FEATURES = ["crop", "state"]
NUMERICAL_FEATURES = ["year", "month_num", "prev_price", "price_diff"]
TARGET_COLUMN = "demand"

DEFAULT_DATA_PATH = Path("data/processed/data_demand.csv")
DEFAULT_MODEL_PATH = Path("ml_models/demand_forecast/demand_model.pkl")


def setup_logger() -> logging.Logger:
	logging.basicConfig(
		level=logging.INFO,
		format="%(asctime)s | %(levelname)s | %(message)s",
		handlers=[logging.StreamHandler(sys.stdout)],
	)
	return logging.getLogger("demand_training")


def resolve_data_path(data_path: Path) -> Path:
	candidate_paths = [
		data_path,
		Path("Data/processed/data_demand.csv"),
		Path("data/processed/demand_dataset.csv"),
		Path("Data/processed/demand_dataset.csv"),
	]
	for candidate in candidate_paths:
		if candidate.exists():
			return candidate

	raise FileNotFoundError(
		"Dataset not found. Checked paths: "
		+ ", ".join(str(path) for path in candidate_paths)
	)


def build_onehot_encoder() -> OneHotEncoder:
	try:
		return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
	except TypeError:
		return OneHotEncoder(handle_unknown="ignore", sparse=False)


def load_data(data_path: Path, logger: logging.Logger) -> pd.DataFrame:
	resolved_path = resolve_data_path(data_path)

	logger.info("Data loaded from: %s", resolved_path)
	df = pd.read_csv(resolved_path)
	logger.info("Dataset shape: %s", df.shape)
	return df


def prepare_features(
	df: pd.DataFrame, logger: logging.Logger
) -> Tuple[pd.DataFrame, pd.Series, ColumnTransformer]:
	missing_cols = REQUIRED_COLUMNS.difference(df.columns)
	if missing_cols:
		raise ValueError(f"Missing required columns: {sorted(missing_cols)}")

	clean_df = df.copy()

	for col in NUMERICAL_FEATURES:
		clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce")

	for col in CATEGORICAL_FEATURES + [TARGET_COLUMN]:
		clean_df[col] = clean_df[col].astype("string")

	before_drop = len(clean_df)
	clean_df = clean_df.dropna(subset=CATEGORICAL_FEATURES + NUMERICAL_FEATURES + [TARGET_COLUMN])
	dropped_rows = before_drop - len(clean_df)
	logger.info("Dropped rows with null/invalid values: %d", dropped_rows)

	if clean_df.empty:
		raise ValueError("No valid rows remain after cleaning. Cannot train model.")

	X = clean_df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES]
	y = clean_df[TARGET_COLUMN]

	preprocessor = ColumnTransformer(
		transformers=[
			(
				"cat",
				build_onehot_encoder(),
				CATEGORICAL_FEATURES,
			),
			("num", "passthrough", NUMERICAL_FEATURES),
		]
	)

	return X, y, preprocessor


def train_model(
	X: pd.DataFrame,
	y: pd.Series,
	preprocessor: ColumnTransformer,
	logger: logging.Logger,
) -> Tuple[Pipeline, pd.DataFrame, pd.Series]:
	class_counts = y.value_counts()
	stratify_target: Optional[pd.Series] = None
	if len(class_counts) > 1 and class_counts.min() >= 2:
		stratify_target = y
	else:
		logger.warning(
			"Stratified split skipped due to insufficient class distribution: %s",
			class_counts.to_dict(),
		)

	X_train, X_test, y_train, y_test = train_test_split(
		X,
		y,
		test_size=0.2,
		random_state=42,
		stratify=stratify_target,
	)

	model = RandomForestClassifier(
		n_estimators=200,
		max_depth=None,
		random_state=42,
	)

	pipeline = Pipeline(
		steps=[
			("preprocessing", preprocessor),
			("model", model),
		]
	)

	logger.info("Training started")
	pipeline.fit(X_train, y_train)
	logger.info("Training completed")

	return pipeline, X_test, y_test


def evaluate_model(
	model_pipeline: Pipeline,
	X_test: pd.DataFrame,
	y_test: pd.Series,
	logger: logging.Logger,
) -> Dict[str, Any]:
	predictions = model_pipeline.predict(X_test)

	accuracy = accuracy_score(y_test, predictions)
	report = classification_report(y_test, predictions)
	matrix = confusion_matrix(y_test, predictions)

	logger.info("Metrics")
	print(f"Accuracy: {accuracy:.4f}")
	print("Classification Report:")
	print(report)
	print("Confusion Matrix:")
	print(matrix)

	return {
		"accuracy": accuracy,
		"classification_report": report,
		"confusion_matrix": matrix,
	}


def main() -> None:
	logger = setup_logger()

	data_path = DEFAULT_DATA_PATH
	model_path = DEFAULT_MODEL_PATH

	try:
		df = load_data(data_path, logger)
		X, y, preprocessor = prepare_features(df, logger)
		model_pipeline, X_test, y_test = train_model(X, y, preprocessor, logger)
		_ = evaluate_model(model_pipeline, X_test, y_test, logger)

		model_path.parent.mkdir(parents=True, exist_ok=True)
		joblib.dump(model_pipeline, model_path)
		logger.info("Model saved to: %s", model_path)

	except FileNotFoundError as exc:
		logger.error("File error: %s", exc)
		raise
	except ValueError as exc:
		logger.error("Data validation error: %s", exc)
		raise
	except Exception as exc:
		logger.exception("Unexpected training failure: %s", exc)
		raise


if __name__ == "__main__":
	main()
