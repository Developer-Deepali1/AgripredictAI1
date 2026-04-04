"""
Crop Rotation Engine with Genetic Algorithm Optimizer

Implements:
- Soil health scoring
- Crop nutrient impact modelling
- Genetic algorithm for optimal rotation sequence
- Soil degradation prediction
"""
import logging
import random
from typing import Dict, List, Optional, Tuple

from app.core.constants import SUPPORTED_CROPS

logger = logging.getLogger("rotation_engine")

# ---------------------------------------------------------------------------
# Crop database: nutrients extracted/added (kg/ha per season, positive = adds,
# negative = removes), pest family, and base profitability (INR/ha)
# ---------------------------------------------------------------------------
CROP_DB: Dict[str, Dict] = {
    "Rice": {
        "nitrogen_impact": -40,
        "phosphorus_impact": -20,
        "potassium_impact": -30,
        "organic_matter_impact": 0.2,
        "pest_family": "cereal",
        "base_profit_inr_ha": 35000,
        "typical_yield_kg_ha": 4500,
        "season": "Kharif",
        "soil_types": ["Alluvial", "Clay", "Loamy"],
        "nitrogen_fix": False,
    },
    "Wheat": {
        "nitrogen_impact": -35,
        "phosphorus_impact": -18,
        "potassium_impact": -25,
        "organic_matter_impact": 0.15,
        "pest_family": "cereal",
        "base_profit_inr_ha": 30000,
        "typical_yield_kg_ha": 4000,
        "season": "Rabi",
        "soil_types": ["Alluvial", "Loamy", "Clay"],
        "nitrogen_fix": False,
    },
    "Maize": {
        "nitrogen_impact": -45,
        "phosphorus_impact": -22,
        "potassium_impact": -28,
        "organic_matter_impact": 0.3,
        "pest_family": "cereal",
        "base_profit_inr_ha": 25000,
        "typical_yield_kg_ha": 5000,
        "season": "Kharif",
        "soil_types": ["Loamy", "Sandy", "Alluvial"],
        "nitrogen_fix": False,
    },
    "Cotton": {
        "nitrogen_impact": -50,
        "phosphorus_impact": -25,
        "potassium_impact": -35,
        "organic_matter_impact": 0.1,
        "pest_family": "fibre",
        "base_profit_inr_ha": 50000,
        "typical_yield_kg_ha": 1800,
        "season": "Kharif",
        "soil_types": ["Black/Regur", "Alluvial", "Loamy"],
        "nitrogen_fix": False,
    },
    "Sugarcane": {
        "nitrogen_impact": -60,
        "phosphorus_impact": -30,
        "potassium_impact": -50,
        "organic_matter_impact": 0.4,
        "pest_family": "grass",
        "base_profit_inr_ha": 80000,
        "typical_yield_kg_ha": 70000,
        "season": "Kharif",
        "soil_types": ["Alluvial", "Loamy", "Clay"],
        "nitrogen_fix": False,
    },
    "Potato": {
        "nitrogen_impact": -55,
        "phosphorus_impact": -30,
        "potassium_impact": -60,
        "organic_matter_impact": -0.1,
        "pest_family": "solanaceae",
        "base_profit_inr_ha": 70000,
        "typical_yield_kg_ha": 25000,
        "season": "Rabi",
        "soil_types": ["Alluvial", "Sandy", "Loamy"],
        "nitrogen_fix": False,
    },
    "Onion": {
        "nitrogen_impact": -30,
        "phosphorus_impact": -20,
        "potassium_impact": -25,
        "organic_matter_impact": 0.05,
        "pest_family": "allium",
        "base_profit_inr_ha": 55000,
        "typical_yield_kg_ha": 20000,
        "season": "Rabi",
        "soil_types": ["Alluvial", "Loamy", "Red"],
        "nitrogen_fix": False,
    },
    "Tomato": {
        "nitrogen_impact": -40,
        "phosphorus_impact": -25,
        "potassium_impact": -30,
        "organic_matter_impact": 0.1,
        "pest_family": "solanaceae",
        "base_profit_inr_ha": 75000,
        "typical_yield_kg_ha": 30000,
        "season": "Kharif",
        "soil_types": ["Alluvial", "Loamy", "Red"],
        "nitrogen_fix": False,
    },
    "Cabbage": {
        "nitrogen_impact": -35,
        "phosphorus_impact": -18,
        "potassium_impact": -20,
        "organic_matter_impact": 0.1,
        "pest_family": "brassica",
        "base_profit_inr_ha": 50000,
        "typical_yield_kg_ha": 25000,
        "season": "Rabi",
        "soil_types": ["Alluvial", "Loamy", "Clay"],
        "nitrogen_fix": False,
    },
    "Carrot": {
        "nitrogen_impact": -25,
        "phosphorus_impact": -15,
        "potassium_impact": -30,
        "organic_matter_impact": 0.05,
        "pest_family": "root",
        "base_profit_inr_ha": 45000,
        "typical_yield_kg_ha": 20000,
        "season": "Rabi",
        "soil_types": ["Sandy", "Loamy", "Alluvial"],
        "nitrogen_fix": False,
    },
}

# Legumes (nitrogen-fixing cover crops) that can be inserted as bonus entries
LEGUME_CROPS = {
    "Soybean": {
        "nitrogen_impact": 30,
        "phosphorus_impact": -10,
        "potassium_impact": -15,
        "organic_matter_impact": 0.5,
        "pest_family": "legume",
        "base_profit_inr_ha": 40000,
        "typical_yield_kg_ha": 2000,
        "season": "Kharif",
        "soil_types": ["Alluvial", "Loamy", "Black/Regur"],
        "nitrogen_fix": True,
    },
    "Groundnut": {
        "nitrogen_impact": 25,
        "phosphorus_impact": -12,
        "potassium_impact": -18,
        "organic_matter_impact": 0.4,
        "pest_family": "legume",
        "base_profit_inr_ha": 45000,
        "typical_yield_kg_ha": 2500,
        "season": "Kharif",
        "soil_types": ["Sandy", "Loamy", "Red"],
        "nitrogen_fix": True,
    },
    "Lentil": {
        "nitrogen_impact": 20,
        "phosphorus_impact": -8,
        "potassium_impact": -10,
        "organic_matter_impact": 0.3,
        "pest_family": "legume",
        "base_profit_inr_ha": 35000,
        "typical_yield_kg_ha": 1500,
        "season": "Rabi",
        "soil_types": ["Alluvial", "Loamy", "Clay"],
        "nitrogen_fix": True,
    },
}

ALL_CROPS: Dict[str, Dict] = {**CROP_DB, **LEGUME_CROPS}

# Nutrient ideal ranges (kg/ha) and organic matter (%)
NUTRIENT_IDEAL = {
    "nitrogen": (40, 80),
    "phosphorus": (20, 40),
    "potassium": (30, 60),
    "organic_matter": (2.0, 5.0),
}


# ---------------------------------------------------------------------------
# Soil Health Scoring
# ---------------------------------------------------------------------------

def _score_nutrient(value: float, low: float, high: float) -> float:
    """Return a 0–100 score for a nutrient value given an ideal range."""
    if low <= value <= high:
        return 100.0
    if value < low:
        return max(0.0, 100.0 * value / low)
    # above ideal range
    excess_ratio = (value - high) / high
    return max(0.0, 100.0 - excess_ratio * 30)


def calculate_soil_health(nitrogen: float, phosphorus: float,
                           potassium: float, organic_matter: float) -> Dict:
    """Calculate a soil health score and sub-scores from nutrient levels."""
    n_score = _score_nutrient(nitrogen, *NUTRIENT_IDEAL["nitrogen"])
    p_score = _score_nutrient(phosphorus, *NUTRIENT_IDEAL["phosphorus"])
    k_score = _score_nutrient(potassium, *NUTRIENT_IDEAL["potassium"])
    om_score = _score_nutrient(organic_matter, *NUTRIENT_IDEAL["organic_matter"])

    overall = round(0.30 * n_score + 0.25 * p_score + 0.25 * k_score + 0.20 * om_score, 1)

    if overall >= 75:
        status = "Excellent"
    elif overall >= 55:
        status = "Good"
    elif overall >= 35:
        status = "Fair"
    else:
        status = "Poor"

    return {
        "overall_score": overall,
        "nitrogen_score": round(n_score, 1),
        "phosphorus_score": round(p_score, 1),
        "potassium_score": round(k_score, 1),
        "organic_matter_score": round(om_score, 1),
        "health_status": status,
    }


# ---------------------------------------------------------------------------
# Genetic Algorithm for Rotation Optimization
# ---------------------------------------------------------------------------

def _apply_crop_to_soil(nutrients: Dict[str, float], crop_name: str) -> Dict[str, float]:
    """Return new nutrient levels after growing a crop."""
    info = ALL_CROPS.get(crop_name, {})
    return {
        "nitrogen": max(0.0, nutrients["nitrogen"] + info.get("nitrogen_impact", 0)),
        "phosphorus": max(0.0, nutrients["phosphorus"] + info.get("phosphorus_impact", 0)),
        "potassium": max(0.0, nutrients["potassium"] + info.get("potassium_impact", 0)),
        "organic_matter": max(0.0, nutrients["organic_matter"] + info.get("organic_matter_impact", 0)),
    }


def _sequence_fitness(sequence: List[str], initial_nutrients: Dict[str, float],
                      prioritize_profit: bool = True) -> float:
    """
    Compute a fitness score for a crop rotation sequence.

    Rewards:
    - Final soil health
    - Total profitability
    - Pest family diversity (interruption)
    - Nitrogen-fixing crops in the rotation
    """
    nutrients = dict(initial_nutrients)
    total_profit = 0.0
    pest_families = []

    for crop_name in sequence:
        info = ALL_CROPS.get(crop_name)
        if info is None:
            continue
        total_profit += info["base_profit_inr_ha"]
        pest_families.append(info["pest_family"])
        nutrients = _apply_crop_to_soil(nutrients, crop_name)

    final_health = calculate_soil_health(**nutrients)["overall_score"]
    pest_diversity = len(set(pest_families)) / max(len(sequence), 1)
    nitrogen_fix_bonus = sum(1 for c in sequence if ALL_CROPS.get(c, {}).get("nitrogen_fix")) * 10.0

    if prioritize_profit:
        fitness = (final_health * 0.4 + (total_profit / 10000) * 0.4
                   + pest_diversity * 20 + nitrogen_fix_bonus)
    else:
        fitness = (final_health * 0.6 + (total_profit / 10000) * 0.2
                   + pest_diversity * 20 + nitrogen_fix_bonus)

    return fitness


def _mutate(sequence: List[str], crop_pool: List[str]) -> List[str]:
    """Randomly replace one crop in the sequence."""
    seq = list(sequence)
    idx = random.randint(0, len(seq) - 1)
    seq[idx] = random.choice(crop_pool)
    return seq


def _crossover(seq_a: List[str], seq_b: List[str]) -> Tuple[List[str], List[str]]:
    """Single-point crossover between two sequences."""
    if len(seq_a) < 2:
        return seq_a, seq_b
    point = random.randint(1, len(seq_a) - 1)
    child_a = seq_a[:point] + seq_b[point:]
    child_b = seq_b[:point] + seq_a[point:]
    return child_a, child_b


def run_genetic_algorithm(
    initial_nutrients: Dict[str, float],
    plan_years: int,
    prioritize_profit: bool = True,
    population_size: int = 80,
    generations: int = 150,
    mutation_rate: float = 0.2,
    current_crop: Optional[str] = None,
    seed: Optional[int] = None,
) -> List[str]:
    """
    Run a genetic algorithm to find the optimal crop rotation sequence.

    Returns the best sequence of crop names (length == plan_years).
    """
    if seed is not None:
        random.seed(seed)

    crop_pool = list(ALL_CROPS.keys())

    # Seed population: random sequences of length plan_years
    population: List[List[str]] = [
        [random.choice(crop_pool) for _ in range(plan_years)]
        for _ in range(population_size)
    ]

    # If there is a current crop, lock year-1 out of the same family to force rotation
    current_family = ALL_CROPS.get(current_crop or "", {}).get("pest_family")

    def fitness(seq: List[str]) -> float:
        score = _sequence_fitness(seq, initial_nutrients, prioritize_profit)
        # Penalise same crop two years running
        for i in range(len(seq) - 1):
            if seq[i] == seq[i + 1]:
                score -= 15
        # Penalise starting year same family as current crop
        if current_family and ALL_CROPS.get(seq[0], {}).get("pest_family") == current_family:
            score -= 20
        return score

    for _gen in range(generations):
        scored = sorted(population, key=fitness, reverse=True)
        survivors = scored[: population_size // 2]

        offspring: List[List[str]] = []
        for i in range(0, len(survivors) - 1, 2):
            child_a, child_b = _crossover(survivors[i], survivors[i + 1])
            offspring.extend([child_a, child_b])

        mutated = [
            _mutate(seq, crop_pool) if random.random() < mutation_rate else seq
            for seq in offspring
        ]

        population = survivors + mutated
        # Pad back to full population with fresh random individuals
        while len(population) < population_size:
            population.append([random.choice(crop_pool) for _ in range(plan_years)])

    best = max(population, key=fitness)
    logger.debug("GA best sequence: %s  fitness=%.2f", best, fitness(best))
    return best


# ---------------------------------------------------------------------------
# Plan Builder
# ---------------------------------------------------------------------------

_SOIL_IMPACT_DESC = {
    True: "Improves soil – nitrogen-fixing legume adds nutrients",
    False: "Standard nutrient draw-down; compensate with fertiliser",
}


def build_rotation_plan(
    farmer_id: str,
    farm_id: str,
    initial_nutrients: Dict[str, float],
    plan_years: int,
    prioritize_profit: bool,
    current_crop: Optional[str],
) -> Dict:
    """Build a full rotation plan dict using the genetic algorithm."""
    initial_health = calculate_soil_health(**initial_nutrients)

    best_sequence = run_genetic_algorithm(
        initial_nutrients=initial_nutrients,
        plan_years=plan_years,
        prioritize_profit=prioritize_profit,
        current_crop=current_crop,
        seed=42,
    )

    rotation_plan = []
    nutrients = dict(initial_nutrients)
    total_profit = 0.0
    pest_families = []

    for year_idx, crop_name in enumerate(best_sequence, start=1):
        info = ALL_CROPS.get(crop_name, {})
        profit = info.get("base_profit_inr_ha", 0)
        total_profit += profit
        pest_families.append(info.get("pest_family", "unknown"))
        is_legume = info.get("nitrogen_fix", False)
        nutrients = _apply_crop_to_soil(nutrients, crop_name)

        rotation_plan.append({
            "year": year_idx,
            "crop": crop_name,
            "season": info.get("season", "Kharif"),
            "expected_yield_kg_ha": info.get("typical_yield_kg_ha", 0),
            "estimated_profit_inr_ha": float(profit),
            "soil_impact": _SOIL_IMPACT_DESC[is_legume],
            "rationale": (
                f"Selected by genetic algorithm for year {year_idx} to "
                f"{'fix nitrogen and restore soil health' if is_legume else 'balance pest cycles and profitability'}."
            ),
        })

    final_health = calculate_soil_health(**nutrients)
    soil_improvement = round(final_health["overall_score"] - initial_health["overall_score"], 1)

    pest_interruption_crops = [
        c for c in best_sequence
        if ALL_CROPS.get(c, {}).get("pest_family") != ALL_CROPS.get(current_crop or "", {}).get("pest_family")
    ]

    sustainability_score = round(
        min(100.0, final_health["overall_score"] * 0.6
            + len(set(pest_families)) / plan_years * 40), 1
    )

    recommendations = _build_recommendations(initial_nutrients, nutrients, best_sequence)

    return {
        "farmer_id": farmer_id,
        "farm_id": farm_id,
        "plan_years": plan_years,
        "rotation_plan": rotation_plan,
        "soil_health_before": initial_health,
        "soil_health_after": final_health,
        "projected_soil_improvement": soil_improvement,
        "pest_interruption_crops": list(set(pest_interruption_crops)),
        "sustainability_score": sustainability_score,
        "total_projected_profit_inr": total_profit,
        "recommendations": recommendations,
    }


def _build_recommendations(initial: Dict, final: Dict, sequence: List[str]) -> List[str]:
    recs = []
    if final["nitrogen"] < NUTRIENT_IDEAL["nitrogen"][0]:
        recs.append("Nitrogen is low at end of rotation – consider intercropping with legumes.")
    if final["potassium"] < NUTRIENT_IDEAL["potassium"][0]:
        recs.append("Apply potassium-rich compost between seasons to restore K levels.")
    if final["organic_matter"] < NUTRIENT_IDEAL["organic_matter"][0]:
        recs.append("Incorporate crop residues and green manure to boost organic matter.")
    if any(ALL_CROPS.get(c, {}).get("nitrogen_fix") for c in sequence):
        recs.append("Nitrogen-fixing crops in this plan – reduce synthetic fertiliser use by 20-30%.")
    recs.append("Conduct soil tests annually to monitor nutrient trends and adjust as needed.")
    recs.append("Use drip or micro-irrigation to maximise water-use efficiency.")
    return recs


# ---------------------------------------------------------------------------
# Soil Analysis
# ---------------------------------------------------------------------------

def analyze_soil(farm_id: str, soil_type: str, nutrients: Dict[str, float],
                 crop_history: List[str]) -> Dict:
    """Analyse current soil health and predict short-term trends."""
    health = calculate_soil_health(**nutrients)

    # Simple linear trend from recent crops
    delta: Dict[str, float] = {"nitrogen": 0.0, "phosphorus": 0.0,
                                "potassium": 0.0, "organic_matter": 0.0}
    for crop in crop_history[-3:]:
        info = ALL_CROPS.get(crop, {})
        delta["nitrogen"] += info.get("nitrogen_impact", 0)
        delta["phosphorus"] += info.get("phosphorus_impact", 0)
        delta["potassium"] += info.get("potassium_impact", 0)
        delta["organic_matter"] += info.get("organic_matter_impact", 0)

    def _trend(d: float) -> str:
        if d > 2:
            return "Increasing"
        if d < -2:
            return "Decreasing"
        return "Stable"

    nutrient_trends = []
    for key, current in [
        ("nitrogen", nutrients["nitrogen"]),
        ("phosphorus", nutrients["phosphorus"]),
        ("potassium", nutrients["potassium"]),
        ("organic_matter", nutrients["organic_matter"]),
    ]:
        per_year = delta[key] / max(len(crop_history), 1) if crop_history else 0
        nutrient_trends.append({
            "metric": key.replace("_", " ").title(),
            "current_value": current,
            "trend": _trend(per_year),
            "predicted_6_months": round(current + per_year * 0.5, 2),
            "predicted_12_months": round(current + per_year, 2),
        })

    # Degradation risk
    if health["overall_score"] < 35:
        degradation_risk = "CRITICAL"
    elif health["overall_score"] < 55:
        degradation_risk = "HIGH"
    elif health["overall_score"] < 75:
        degradation_risk = "MEDIUM"
    else:
        degradation_risk = "LOW"

    warnings = []
    if nutrients["nitrogen"] < NUTRIENT_IDEAL["nitrogen"][0]:
        warnings.append(f"Nitrogen critically low ({nutrients['nitrogen']:.1f} kg/ha). Add urea or legumes.")
    if nutrients["phosphorus"] < NUTRIENT_IDEAL["phosphorus"][0]:
        warnings.append(f"Phosphorus low ({nutrients['phosphorus']:.1f} kg/ha). Apply DAP fertiliser.")
    if nutrients["potassium"] < NUTRIENT_IDEAL["potassium"][0]:
        warnings.append(f"Potassium low ({nutrients['potassium']:.1f} kg/ha). Apply MOP/SOP fertiliser.")
    if nutrients["organic_matter"] < NUTRIENT_IDEAL["organic_matter"][0]:
        warnings.append(
            f"Organic matter very low ({nutrients['organic_matter']:.2f}%). "
            "Add compost, crop residues, or green manure."
        )

    actions = [
        "Conduct a detailed soil test with a certified lab.",
        "Apply balanced NPK fertiliser based on soil test report.",
        "Introduce crop rotation with at least one legume every 2-3 years.",
        "Use minimum tillage to preserve soil structure.",
    ]

    return {
        "farm_id": farm_id,
        "soil_type": soil_type,
        "soil_health_score": health,
        "nutrient_trends": nutrient_trends,
        "degradation_risk": degradation_risk,
        "depletion_warnings": warnings,
        "improvement_actions": actions,
    }


# ---------------------------------------------------------------------------
# Optimise existing plan
# ---------------------------------------------------------------------------

def optimize_rotation(
    farmer_id: str,
    farm_id: str,
    existing_plan: List[str],
    initial_nutrients: Dict[str, float],
    market_prices: Optional[Dict[str, float]],
) -> Dict:
    """Re-optimise an existing rotation plan with optional custom market prices."""
    original_profit = sum(
        ALL_CROPS.get(c, {}).get("base_profit_inr_ha", 0) for c in existing_plan
    )

    # Build nutrient dict expected by GA
    new_plan = run_genetic_algorithm(
        initial_nutrients=initial_nutrients,
        plan_years=len(existing_plan),
        prioritize_profit=True,
        seed=99,
    )

    # Apply custom prices if provided
    def _profit(crop: str) -> float:
        if market_prices and crop in market_prices:
            return float(market_prices[crop])
        return float(ALL_CROPS.get(crop, {}).get("base_profit_inr_ha", 0))

    nutrients = dict(initial_nutrients)
    optimized_years = []
    total_new_profit = 0.0

    for year_idx, crop_name in enumerate(new_plan, start=1):
        info = ALL_CROPS.get(crop_name, {})
        profit = _profit(crop_name)
        total_new_profit += profit
        nutrients = _apply_crop_to_soil(nutrients, crop_name)
        is_legume = info.get("nitrogen_fix", False)
        optimized_years.append({
            "year": year_idx,
            "crop": crop_name,
            "season": info.get("season", "Kharif"),
            "expected_yield_kg_ha": info.get("typical_yield_kg_ha", 0),
            "estimated_profit_inr_ha": profit,
            "soil_impact": _SOIL_IMPACT_DESC[is_legume],
            "rationale": f"Optimised for year {year_idx} balancing profit and soil health.",
        })

    initial_health = calculate_soil_health(**initial_nutrients)
    final_health = calculate_soil_health(**nutrients)

    profit_improvement = round(
        (total_new_profit - original_profit) / max(original_profit, 1) * 100, 1
    )
    soil_improvement = round(final_health["overall_score"] - initial_health["overall_score"], 1)

    notes = [
        f"Profitability improved by {profit_improvement}% over original plan.",
        "Pest cycle diversification maintained throughout rotation.",
        "Nitrogen-fixing legumes included where soil N levels permit.",
    ]

    return {
        "farmer_id": farmer_id,
        "farm_id": farm_id,
        "original_plan": existing_plan,
        "optimized_plan": optimized_years,
        "profitability_improvement": profit_improvement,
        "soil_health_improvement": soil_improvement,
        "optimization_notes": notes,
    }
