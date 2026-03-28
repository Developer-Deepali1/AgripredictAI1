"""
Smart Crop Recommendation API endpoints
"""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Query, HTTPException, status

from app.core.constants import SUPPORTED_CROPS
from app.schemas.recommendation_schema import (
    RecommendationExplanation,
    SmartRecommendation,
    SmartRecommendationResponse,
)

router = APIRouter()

_SCORES: dict = {
    "Rice":      {"profit": 55, "feasibility": 80, "risk": 4.2},
    "Wheat":     {"profit": 60, "feasibility": 85, "risk": 3.0},
    "Maize":     {"profit": 45, "feasibility": 75, "risk": 4.0},
    "Cotton":    {"profit": 65, "feasibility": 70, "risk": 5.5},
    "Sugarcane": {"profit": 70, "feasibility": 72, "risk": 2.5},
    "Potato":    {"profit": 80, "feasibility": 78, "risk": 6.5},
    "Onion":     {"profit": 75, "feasibility": 70, "risk": 7.5},
    "Tomato":    {"profit": 88, "feasibility": 75, "risk": 7.2},
    "Cabbage":   {"profit": 58, "feasibility": 72, "risk": 5.2},
    "Carrot":    {"profit": 62, "feasibility": 70, "risk": 4.2},
}

_REASONS: dict = {
    "Rice":      ["Stable MSP support", "High domestic demand", "Suitable for alluvial plains"],
    "Wheat":     ["Guaranteed MSP procurement", "Rabi season staple", "Low weather risk"],
    "Maize":     ["Growing poultry-feed demand", "Versatile crop", "Moderate input cost"],
    "Cotton":    ["High export demand", "Strong MSP", "Ideal for black-soil regions"],
    "Sugarcane": ["Assured mill procurement", "High yield per acre", "Long shelf life (mill processing)"],
    "Potato":    ["Very high yield potential", "Strong urban demand", "Cold-storage extends selling window"],
    "Onion":     ["High-value volatile crop", "Export demand from Middle East", "Short crop cycle"],
    "Tomato":    ["Highest revenue potential", "Year-round market", "Processing industry demand"],
    "Cabbage":   ["Fast-growing vegetable", "Urban market demand", "Good rotation crop"],
    "Carrot":    ["Urban premium market", "Low competition", "High nutrition value"],
}

_EXPLANATIONS: dict = {
    "Rice": {
        "summary": "Rice is a staple crop with stable government support via MSP.",
        "profit_analysis": "Generates ₹38,500/ha revenue with moderate input costs around ₹35,000/ha.",
        "risk_analysis": "Weather risk is moderate. Flood-prone areas need PMFBY insurance.",
        "feasibility_analysis": "Best in alluvial plains of Punjab, Haryana, UP, and Bengal.",
        "market_outlook": "Domestic demand stable; export markets opening post-MSP revisions.",
        "tips": ["Use SRI method to reduce water use by 30%", "Opt for drought-tolerant varieties",
                 "Join FPO for better MSP access"],
    },
    "Wheat": {
        "summary": "Wheat is India's most important Rabi crop with guaranteed FCI procurement.",
        "profit_analysis": "Revenue ₹73,600/ha with cost ₹30,000/ha gives excellent margin.",
        "risk_analysis": "Low weather risk in North India winters. Heat wave near harvest is the main risk.",
        "feasibility_analysis": "Ideal in Punjab, Haryana, UP, and MP black cotton soils.",
        "market_outlook": "Strong domestic demand; government procurement keeps floor price stable.",
        "tips": ["Use zero-tillage to cut costs by ₹5,000/ha", "Target early harvest to avoid late-season heat",
                 "Store in moisture-proof bags"],
    },
    "Maize": {
        "summary": "Maize demand is growing rapidly due to poultry and starch industries.",
        "profit_analysis": "Lower per-kg price but low input cost makes it moderately profitable.",
        "risk_analysis": "Fall armyworm is an emerging pest risk. Market prices fluctuate with poultry demand.",
        "feasibility_analysis": "Grows well in red and laterite soils of Karnataka, Bihar, UP.",
        "market_outlook": "Ethanol blending policy driving strong demand growth.",
        "tips": ["Use improved hybrid seeds for 40% yield boost", "Target ethanol producers for contracts",
                 "Use drip irrigation for water efficiency"],
    },
    "Cotton": {
        "summary": "Cotton is a major cash crop with strong export potential.",
        "profit_analysis": "High price ₹55/kg with good yields makes it one of the top cash crops.",
        "risk_analysis": "Pink bollworm and weather volatility are significant risks.",
        "feasibility_analysis": "Black cotton soil (Vertisols) in Maharashtra, Gujarat, and Telangana is ideal.",
        "market_outlook": "Global cotton demand recovering; CCI procurement provides price support.",
        "tips": ["Use Bt cotton for pest resistance", "Sell via CCI for minimum price protection",
                 "Drip irrigation increases yield by 15-20%"],
    },
    "Sugarcane": {
        "summary": "Sugarcane offers assured procurement by sugar mills at Fair and Remunerative Price (FRP).",
        "profit_analysis": "Very high yield (70,000 kg/ha) compensates for lower price per kg.",
        "risk_analysis": "Low market risk due to FRP. High water requirement is the main constraint.",
        "feasibility_analysis": "Best in UP, Maharashtra, Karnataka, and Tamil Nadu with canal irrigation.",
        "market_outlook": "Ethanol blending program creating additional demand from sugar mills.",
        "tips": ["Use drip irrigation to reduce water use by 40%", "Plant ratoon crop to save replanting cost",
                 "Settle mill dues through cooperative membership"],
    },
    "Potato": {
        "summary": "Potato has the highest yield potential among vegetables in India.",
        "profit_analysis": "22,000 kg/ha yield × ₹8/kg gives ₹1,76,000 revenue, profit ₹1,06,000/ha.",
        "risk_analysis": "Price crash risk is high if planting area increases nationally.",
        "feasibility_analysis": "Loamy fertile soils of UP, Bihar, and West Bengal are ideal.",
        "market_outlook": "Processing demand (chips, frozen) growing at 15% annually.",
        "tips": ["Book cold storage early (Oct-Nov)", "Seed certification ensures disease-free crop",
                 "Target processing companies for contract sales"],
    },
    "Onion": {
        "summary": "Onion is a high-value but high-volatility crop with strong export demand.",
        "profit_analysis": "Prices vary ₹6–₹25/kg. Good year gives ₹2,40,000/ha revenue.",
        "risk_analysis": "Highly volatile prices; overproduction years can wipe out margins.",
        "feasibility_analysis": "Nashik (Maharashtra), Rajasthan, and Karnataka are prime zones.",
        "market_outlook": "Middle East and Southeast Asia import large volumes from India.",
        "tips": ["Stagger planting by 2-3 batches to avoid peak glut", "Use NHRDF-registered varieties",
                 "Explore direct export through agri-export hubs"],
    },
    "Tomato": {
        "summary": "Tomato gives the highest revenue potential but requires careful market timing.",
        "profit_analysis": "25,000 kg/ha × ₹18/kg = ₹4,50,000 revenue; profit ₹3,75,000/ha in good season.",
        "risk_analysis": "Price can crash to ₹2-3/kg in glut years. Weather and disease risks are high.",
        "feasibility_analysis": "Karnataka (Kolar), Andhra Pradesh, and Maharashtra are major producers.",
        "market_outlook": "Processing tomato demand growing; ketchup and sauce industries expanding.",
        "tips": ["Use polyhouse for premium off-season production", "Sell to Heinz/ITC for contract price",
                 "Invest in drip fertigation for 20% higher yield"],
    },
    "Cabbage": {
        "summary": "Cabbage is a fast-growing vegetable with steady urban market demand.",
        "profit_analysis": "High yield (30,000 kg/ha) with moderate price gives good margins.",
        "risk_analysis": "Glut during peak Rabi season can crash prices. Short shelf life is a challenge.",
        "feasibility_analysis": "Grows well in cool climate regions — Himachal, UP hills, and Karnataka.",
        "market_outlook": "Institutional demand from hotels and restaurants is growing steadily.",
        "tips": ["Plan harvest calendar to avoid Nov-Feb glut", "Supply to school mid-day meal programs",
                 "Use vacuum cooling for extended shelf life"],
    },
    "Carrot": {
        "summary": "Carrot is a premium vegetable with growing urban health-conscious demand.",
        "profit_analysis": "20,000 kg/ha × ₹10/kg gives ₹2,00,000 revenue with ₹1,55,000 profit/ha.",
        "risk_analysis": "Lower volatility than onion/tomato. Cold chain access is key.",
        "feasibility_analysis": "Sandy loam soils in UP, Punjab, and Rajasthan produce best roots.",
        "market_outlook": "Baby carrot and processed carrot segments growing in urban retail.",
        "tips": ["Plant Nantes variety for uniform roots", "Supply to baby food manufacturers",
                 "Use drip irrigation to prevent root cracking"],
    },
}


def _combined_score(crop: str) -> float:
    s = _SCORES[crop]
    # Higher profit and feasibility = better; higher risk = worse
    return round((s["profit"] * 0.45 + s["feasibility"] * 0.30 + (10 - s["risk"]) * 2.5), 2)


@router.get("/smart", response_model=SmartRecommendationResponse)
def get_smart_recommendations(
    top_n: int = Query(3, ge=1, le=10, description="Number of top crops to return"),
) -> SmartRecommendationResponse:
    """Return top N smart crop recommendations ranked by combined profit, feasibility, and risk score."""
    ranked = sorted(SUPPORTED_CROPS, key=_combined_score, reverse=True)[:top_n]
    recs: List[SmartRecommendation] = []
    for rank, crop in enumerate(ranked, start=1):
        s = _SCORES[crop]
        recs.append(SmartRecommendation(
            crop_name=crop,
            profit_score=s["profit"],
            feasibility_score=s["feasibility"],
            risk_score=s["risk"],
            combined_score=_combined_score(crop),
            reasons=_REASONS[crop],
            recommendation_rank=rank,
        ))
    return SmartRecommendationResponse(
        recommendations=recs,
        generated_at=datetime.utcnow().isoformat(),
    )


@router.get("/explain", response_model=RecommendationExplanation)
def explain_recommendation(
    crop: str = Query(..., description="Crop name to explain"),
) -> RecommendationExplanation:
    """Provide a detailed explanation for why a specific crop is or isn't recommended."""
    matched = None
    for c in SUPPORTED_CROPS:
        if c.lower() == crop.lower():
            matched = c
            break
    if not matched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Crop '{crop}' not found.")
    e = _EXPLANATIONS[matched]
    return RecommendationExplanation(
        crop=matched,
        summary=e["summary"],
        profit_analysis=e["profit_analysis"],
        risk_analysis=e["risk_analysis"],
        feasibility_analysis=e["feasibility_analysis"],
        market_outlook=e["market_outlook"],
        tips=e["tips"],
    )
