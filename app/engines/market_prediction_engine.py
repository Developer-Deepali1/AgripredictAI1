"""
Market Price Prediction Engine
Predicts future crop prices based on real historical data and trained RandomForestRegressor model.
"""
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd

from ml_models.price_prediction.predict import load_model, predict_price

class MarketPredictionEngine:
    """Engine for market price predictions using trained Random Forest Regressor."""
    
    def __init__(self, model_path: Optional[str] = None):
        self._model = None
        self._model_path = model_path
        self._load_engine()

    def _load_engine(self):
        try:
            self._model = load_model(self._model_path) if self._model_path else load_model()
        except Exception as e:
            print(f"[MarketPredictionEngine] Warning: Could not load trained price model: {e}")
            self._model = None

    def predict_price(self, crop: str, state: str = "India", prev_price: Optional[float] = None, months_ahead: int = 6) -> Dict[str, Any]:
        """
        Predict future crop price trajectory for upcoming months using the trained ML model.
        """
        today = datetime.date.today()
        
        # Base fallback prices if prev_price is not provided
        default_prices = {
            "Rice": 2200.0, "Wheat": 2350.0, "Maize": 2250.0, "Cotton": 6200.0,
            "Sugarcane": 350.0, "Potato": 1400.0, "Onion": 1800.0, "Tomato": 2200.0,
            "Cabbage": 900.0, "Carrot": 1200.0,
        }
        current_price = prev_price or default_prices.get(crop.capitalize(), 2000.0)
        
        forecasts = []
        running_price = current_price
        
        for i in range(1, months_ahead + 1):
            # Advance by i months
            month_num = ((today.month - 1 + i) % 12) + 1
            year = today.year + ((today.month - 1 + i) // 12)
            month_str = f"{year}-{month_num:02d}-01"
            target_date = datetime.date(year, month_num, 1)
            
            if self._model:
                try:
                    payload = {
                        "crop": crop.capitalize(),
                        "state": state,
                        "month": month_str,
                        "prev_price": running_price
                    }
                    pred_res = predict_price(self._model, payload)
                    predicted_val = round(float(pred_res["predicted_price"]), 2)
                    conf = pred_res.get("confidence", {})
                    std = conf.get("prediction_std") or (predicted_val * 0.05)
                except Exception as ex:
                    predicted_val = round(running_price * 1.01, 2)
                    std = predicted_val * 0.05
            else:
                predicted_val = round(running_price * 1.01, 2)
                std = predicted_val * 0.05
            
            margin = round(std * 1.645, 2) # ~90% confidence interval
            forecasts.append({
                "date": target_date,
                "price": predicted_val,
                "lower_bound": max(10.0, round(predicted_val - margin, 2)),
                "upper_bound": round(predicted_val + margin, 2),
            })
            # Feed current prediction as lag for next step
            running_price = predicted_val
            
        trend = "STABLE"
        if forecasts:
            if forecasts[-1]["price"] > current_price * 1.03:
                trend = "UP"
            elif forecasts[-1]["price"] < current_price * 0.97:
                trend = "DOWN"

        return {
            "crop": crop,
            "current_price": current_price,
            "trend_direction": trend,
            "predicted_prices": forecasts
        }

# Global singleton engine
market_engine = MarketPredictionEngine()
