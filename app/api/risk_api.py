"""
Risk Assessment API endpoints
"""
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.risk_schema import (
    MitigationStrategy,
    RiskAssessRequest,
    RiskAssessResponse,
    RiskFactor,
    RiskFactors,
)

router = APIRouter()

_BASE_RISK: dict = {
    "Rice":      {"price_drop": 3.5, "oversupply": 4.0, "weather": 5.5, "volatility": 3.0},
    "Wheat":     {"price_drop": 2.5, "oversupply": 3.0, "weather": 3.5, "volatility": 2.5},
    "Maize":     {"price_drop": 4.0, "oversupply": 4.5, "weather": 4.0, "volatility": 3.5},
    "Cotton":    {"price_drop": 5.0, "oversupply": 4.0, "weather": 6.0, "volatility": 5.5},
    "Sugarcane": {"price_drop": 2.0, "oversupply": 3.5, "weather": 3.0, "volatility": 2.0},
    "Potato":    {"price_drop": 6.0, "oversupply": 7.0, "weather": 4.5, "volatility": 6.5},
    "Onion":     {"price_drop": 7.5, "oversupply": 8.0, "weather": 5.0, "volatility": 8.0},
    "Tomato":    {"price_drop": 7.0, "oversupply": 7.5, "weather": 5.5, "volatility": 7.5},
    "Cabbage":   {"price_drop": 5.5, "oversupply": 6.0, "weather": 4.0, "volatility": 5.0},
    "Carrot":    {"price_drop": 4.5, "oversupply": 5.0, "weather": 3.5, "volatility": 4.0},
}

_MITIGATION_MAP: dict = {
    "Rice":      ["Join Pradhan Mantri Fasal Bima Yojana (PMFBY)", "Use MSP as price floor",
                  "Store in government warehouses post-harvest", "Switch to SRI method for water savings"],
    "Wheat":     ["Sell via APMC or FCI procurement", "Use Minimum Support Price guarantee",
                  "Diversify with pulses in rotation", "Use moisture meters before storage"],
    "Maize":     ["Target poultry feed market for stable demand", "Use e-NAM platform for better prices",
                  "Contract farming with starch industries", "Apply crop insurance"],
    "Cotton":    ["Bt cotton for pest resistance", "Sell via Cotton Corporation of India",
                  "Use futures market for price hedging", "Diversify with pulses"],
    "Sugarcane": ["Sell to nearby sugar mills under FRP", "Join cooperative sugar mills",
                  "Use drip irrigation to reduce water cost", "Monitor variety performance annually"],
    "Potato":    ["Use cold storage facilities for 3-6 months", "Process into chips/starch for value addition",
                  "Stagger planting dates to avoid glut", "Register with NAFED"],
    "Onion":     ["Store in well-ventilated facilities", "Target export markets via NHRDF",
                  "Grow late-season varieties to avoid peak glut", "Diversify to garlic or other alliums"],
    "Tomato":    ["Use polyhouses for protected cultivation", "Target processing industry contracts",
                  "Stagger sowing to reduce market glut", "Invest in drip fertigation"],
    "Cabbage":   ["Plan sowing calendar to avoid seasonal glut", "Supply to hotels/restaurants directly",
                  "Use cold chain logistics", "Explore contract farming"],
    "Carrot":    ["Target urban markets and supermarkets", "Process into juice/baby food",
                  "Use drip irrigation for uniform root development", "Maintain cold chain"],
}

_RISK_FACTORS_INFO: List[RiskFactor] = [
    RiskFactor(name="Price Drop Risk", description="Likelihood of market prices falling below cost of production",
               impact="HIGH"),
    RiskFactor(name="Oversupply Risk", description="Risk of market flooded by excess production causing price crash",
               impact="HIGH"),
    RiskFactor(name="Weather Risk", description="Crop loss probability due to drought, flood, or untimely rain",
               impact="MEDIUM"),
    RiskFactor(name="Market Volatility", description="Day-to-day price fluctuation that makes planning difficult",
               impact="MEDIUM"),
    RiskFactor(name="Input Cost Risk", description="Rising seed, fertilizer, and labour costs eroding margins",
               impact="MEDIUM"),
    RiskFactor(name="Pest & Disease Risk", description="Pest outbreaks or disease epidemics damaging the crop",
               impact="HIGH"),
]

_MITIGATION_STRATEGIES: List[MitigationStrategy] = [
    MitigationStrategy(strategy="Crop Insurance (PMFBY)", applicable_risks=["Weather Risk", "Pest & Disease Risk"],
                       effectiveness="High"),
    MitigationStrategy(strategy="Contract Farming", applicable_risks=["Price Drop Risk", "Market Volatility"],
                       effectiveness="High"),
    MitigationStrategy(strategy="Cold Storage", applicable_risks=["Oversupply Risk", "Price Drop Risk"],
                       effectiveness="Medium"),
    MitigationStrategy(strategy="MSP Protection", applicable_risks=["Price Drop Risk"],
                       effectiveness="High"),
    MitigationStrategy(strategy="Crop Diversification", applicable_risks=["Oversupply Risk", "Market Volatility"],
                       effectiveness="Medium"),
    MitigationStrategy(strategy="e-NAM Trading", applicable_risks=["Market Volatility", "Price Drop Risk"],
                       effectiveness="Medium"),
]


def _risk_level(score: float) -> str:
    if score <= 3.0:
        return "LOW"
    if score <= 5.5:
        return "MEDIUM"
    if score <= 7.5:
        return "HIGH"
    return "CRITICAL"


def _normalize_crop(crop: str) -> str:
    for c in SUPPORTED_CROPS:
        if c.lower() == crop.lower():
            return c
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Crop '{crop}' not supported.")


@router.post("/assess", response_model=RiskAssessResponse)
def assess_risk(payload: RiskAssessRequest) -> RiskAssessResponse:
    """Assess the risk profile for a specific crop with breakdown by risk factor."""
    crop = _normalize_crop(payload.crop)
    r = _BASE_RISK[crop]
    overall = round((r["price_drop"] + r["oversupply"] + r["weather"] + r["volatility"]) / 4, 2)
    return RiskAssessResponse(
        crop=crop,
        overall_risk_score=overall,
        risk_level=_risk_level(overall),
        risk_factors=RiskFactors(
            price_drop_risk=r["price_drop"],
            oversupply_risk=r["oversupply"],
            weather_risk=r["weather"],
            market_volatility=r["volatility"],
        ),
        mitigation_strategies=_MITIGATION_MAP[crop],
    )


@router.get("/factors", response_model=List[RiskFactor])
def get_risk_factors() -> List[RiskFactor]:
    """Return a list of risk factors considered in agricultural risk assessment."""
    return _RISK_FACTORS_INFO


@router.get("/mitigation", response_model=List[MitigationStrategy])
def get_mitigation_strategies() -> List[MitigationStrategy]:
    """Return general risk mitigation strategies for Indian agriculture."""
    return _MITIGATION_STRATEGIES
