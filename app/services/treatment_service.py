"""
Organic & Bio-Fungicide Treatment Engine
Agronomic treatment protocols, causes, symptoms, and organic remedies for crop diseases.
"""
from typing import Dict, List, Optional
from app.schemas.disease_schema import TreatmentDetail


DISEASE_KNOWLEDGE: Dict[str, Dict[str, any]] = {
    # ── RICE ──
    "Rice_Blast": {
        "crop": "Rice",
        "disease_name": "Rice Blast (Magnaporthe oryzae)",
        "symptoms": "Spindle-shaped or diamond-shaped lesions with grey or white centers and brown margins on leaves, nodes, and panicles.",
        "cause": "Fungal pathogen Magnaporthe oryzae favored by high humidity (>90%), cool nights (17-20°C), and excessive nitrogen fertilizer.",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Neem Seed Kernel Extract (NSKE 5%) or Trichoderma viride @ 5g/L water at 7-10 day intervals.",
            chemical_backup="In severe infection, spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L.",
            prevention_tips=[
                "Avoid excessive split applications of chemical nitrogen fertilizers.",
                "Maintain thin standing water layer; avoid alternate severe drying and flooding.",
                "Burn or deeply plow infected stubble post-harvest.",
                "Treat seeds with Pseudomonas fluorescens @ 10g/kg seed before sowing."
            ],
            dosages="Neem oil: 5ml/L with 1ml liquid soap surfactant. Spray during early morning or late afternoon."
        )
    },
    "Rice_Bacterial_Blight": {
        "crop": "Rice",
        "disease_name": "Bacterial Leaf Blight (Xanthomonas oryzae)",
        "symptoms": "Water-soaked streaks on leaf margins that rapidly enlarge, turn yellow, then white/grey with wavy margins.",
        "cause": "Bacterium Xanthomonas oryzae entering through hydathodes or wounds, aggravated by wind-driven rain and flooding.",
        "treatment": TreatmentDetail(
            organic_remedy="Spray fresh cow dung supernatant (20g/L) mixed with Pseudomonas fluorescens bio-formulation @ 5ml/L.",
            chemical_backup="Spray Copper Hydroxide 77% WP @ 2.0g/L or Streptomycin sulphate + Tetracycline (90:10) @ 0.1g/L.",
            prevention_tips=[
                "Ensure proper field drainage; do not allow irrigation water to flow from infected to healthy fields.",
                "Balance nitrogen with adequate potassium application (K strengthens cell walls).",
                "Use certified resistant varieties like IR64 or Improved Samba Mahsuri."
            ],
            dosages="Apply 500L spray volume per hectare. Repeat spray after 12 days if rains continue."
        )
    },
    "Rice_Brown_Spot": {
        "crop": "Rice",
        "disease_name": "Brown Spot (Bipolaris oryzae)",
        "symptoms": "Circular to oval brown spots resembling sesame seeds with yellow halos scattered over leaf blades.",
        "cause": "Fungal infection typically associated with poor nutrient availability, zinc deficiency, and sandy or nutrient-leached soils.",
        "treatment": TreatmentDetail(
            organic_remedy="Apply compost tea foliar spray combined with Panchagavya @ 3% (30ml/L) and zinc sulfate soil enrichment.",
            chemical_backup="Foliar spray of Mancozeb 75% WP @ 2g/L or Propiconazole 25% EC @ 1ml/L.",
            prevention_tips=[
                "Correct soil micronutrient deficiencies, especially Zinc and Silicon.",
                "Apply well-decomposed Farmyard Manure (FYM) @ 10 tonnes/ha.",
                "Soak seeds in 1% potassium nitrate solution before nursery sowing."
            ],
            dosages="Panchagavya: 30ml/L or bio-fungicide Bacillus subtilis @ 5g/L."
        )
    },
    "Rice_Tungro": {
        "crop": "Rice",
        "disease_name": "Rice Tungro Disease (RTSV & RTBV)",
        "symptoms": "Stunted plants, leaf discoloration starting from tip turning yellow to orange, fewer tillers.",
        "cause": "Viral complex transmitted by the green leafhopper (Nephotettix virescens).",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Neem oil @ 5ml/L or Beauveria bassiana entomopathogenic fungus @ 5g/L to control vector leafhoppers.",
            chemical_backup="Apply Thiamethoxam 25% WG @ 0.2g/L or Imidacloprid 17.8% SL @ 0.3ml/L against green leafhoppers.",
            prevention_tips=[
                "Uproot and bury infected diseased clumps immediately.",
                "Set up light traps (1 trap/acre) to monitor and trap leafhopper vectors.",
                "Synchronize planting in the community to break the vector breeding cycle."
            ],
            dosages="Spray bio-agent Beauveria early morning directly targeting leaf base where leafhoppers congregate."
        )
    },
    "Rice_Healthy": {
        "crop": "Rice",
        "disease_name": "Healthy Rice Plant",
        "symptoms": "Vibrant green leaves, uniform upright tillers, smooth leaf surfaces with no necrotic or water-soaked lesions.",
        "cause": "Optimal soil nutrition, balanced irrigation, and disease-free ecosystem.",
        "treatment": TreatmentDetail(
            organic_remedy="No curative treatment needed. Continue regular organic foliar nutrition (e.g. Jeevamrutha or seaweed extract).",
            chemical_backup="None required.",
            prevention_tips=[
                "Maintain periodic soil moisture monitoring.",
                "Scout field twice weekly for early signs of stem borer or blast.",
                "Maintain clean bunds free of weed hosts."
            ],
            dosages="Periodic preventive bio-spray: 2% Jeevamrutha once every 15 days."
        )
    },

    # ── WHEAT ──
    "Wheat_Yellow_Rust": {
        "crop": "Wheat",
        "disease_name": "Yellow Rust / Stripe Rust (Puccinia striiformis)",
        "symptoms": "Bright yellow, linear powdery pustules arranged in parallel stripes along the leaf veins.",
        "cause": "Airborne fungal spores thriving in cool, damp weather (10-15°C) with persistent morning dew or fog.",
        "treatment": TreatmentDetail(
            organic_remedy="Foliar spray with fermented buttermilk (sour lassi) @ 50ml/L or fermented garlic-chilli extract.",
            chemical_backup="Spray Propiconazole 25% EC (Tilt) @ 1ml/L or Tebuconazole 25.9% EC @ 1.25ml/L at first appearance.",
            prevention_tips=[
                "Plant yellow-rust resistant cultivars (e.g., HD-2967, DBW-187, DBW-303).",
                "Avoid late sowing to prevent wheat ripening during warm rust sporulation windows.",
                "Destroy volunteer wheat seedlings and weed hosts along canal banks."
            ],
            dosages="Spray 500L water/ha with hollow cone nozzle covering both upper and lower foliage."
        )
    },
    "Wheat_Brown_Rust": {
        "crop": "Wheat",
        "disease_name": "Brown Rust / Leaf Rust (Puccinia triticina)",
        "symptoms": "Small, round, orange-brown pustules scattered randomly across the upper leaf surface without stripe formation.",
        "cause": "Puccinia triticina fungus favored by moderate temperatures (18-25°C) and high relative humidity.",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Trichoderma harzianum @ 5g/L combined with 1% potassium silicate to thicken epidermal barrier.",
            chemical_backup="Apply Propiconazole 25% EC @ 1ml/L or Mancozeb 75% WP @ 2g/L.",
            prevention_tips=[
                "Apply recommended dose of potash (K2O @ 40-50 kg/ha) to strengthen leaf cuticle resistance.",
                "Rotate with leguminous crops like chickpea or lentil in next cycle."
            ],
            dosages="1ml Propiconazole per liter of water. Ensure thorough canopy wetting."
        )
    },
    "Wheat_Black_Rust": {
        "crop": "Wheat",
        "disease_name": "Black Rust / Stem Rust (Puccinia graminis)",
        "symptoms": "Elongated reddish-brown to dark black pustules rupturing the epidermis on stems and leaf sheaths.",
        "cause": "Puccinia graminis fungal spores carried by high-altitude winds during warmer spring periods (>20°C).",
        "treatment": TreatmentDetail(
            organic_remedy="Spray 5% neem seed oil formulation or sulphur-based organic dusts @ 25 kg/ha.",
            chemical_backup="Foliar application of Tebuconazole + Trifloxystrobin @ 0.7g/L or Hexaconazole 5% EC @ 2ml/L.",
            prevention_tips=[
                "Eliminate alternate barberry host bushes in vicinity of fields.",
                "Early sowing in late October / early November minimizes exposure to late-season stem rust."
            ],
            dosages="Apply bio-control spray twice at 10-day intervals."
        )
    },
    "Wheat_Healthy": {
        "crop": "Wheat",
        "disease_name": "Healthy Wheat Plant",
        "symptoms": "Uniform emerald green canopy, thick healthy culms, clean leaves without pustules or lesions.",
        "cause": "Optimal winter conditions and balanced fertilization.",
        "treatment": TreatmentDetail(
            organic_remedy="No disease treatment necessary. Apply Vermiwash @ 5% for enhanced grain filling.",
            chemical_backup="None required.",
            prevention_tips=[
                "Irrigate at critical growth stages (CRI, Tillering, Flowering).",
                "Ensure proper weed control during first 35 days."
            ],
            dosages="Foliar micronutrient spray if required."
        )
    },

    # ── CORN / MAIZE ──
    "Corn_Common_Rust": {
        "crop": "Corn",
        "disease_name": "Common Rust (Puccinia sorghi)",
        "symptoms": "Oval to elongated cinnamon-brown pustules scattered over both upper and lower leaf surfaces.",
        "cause": "Fungus Puccinia sorghi favored by moderate temperatures (16-24°C) and high humidity.",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Wettable Sulphur (80% WP) @ 2.5g/L or Trichoderma viride @ 5g/L.",
            chemical_backup="Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L or Mancozeb @ 2.5g/L.",
            prevention_tips=[
                "Plant rust-tolerant hybrid seeds.",
                "Avoid late planting which exposes young crops to airborne spore showers."
            ],
            dosages="Spray early morning before wind speeds pick up."
        )
    },
    "Corn_Cercospora_Leaf_Spot": {
        "crop": "Corn",
        "disease_name": "Gray Leaf Spot (Cercospora zeae-maydis)",
        "symptoms": "Small, rectangular lesions bounded by leaf veins; lesions turn tan or grey with yellowish borders.",
        "cause": "Fungal pathogen overwintering on corn debris, stimulated by warm, humid overcast periods.",
        "treatment": TreatmentDetail(
            organic_remedy="Foliar spray of Bacillus amyloliquefaciens bio-fungicide @ 3g/L or copper oxychloride @ 2g/L.",
            chemical_backup="Apply Pyraclostrobin 20% WG @ 1g/L or Carbendazim 50% WP @ 1g/L.",
            prevention_tips=[
                "Crop rotation away from maize for at least 1-2 seasons.",
                "Tillage to bury infected corn stover to accelerate fungal decomposition."
            ],
            dosages="Apply at tasseling stage if weather is warm and overcast."
        )
    },
    "Corn_Northern_Leaf_Blight": {
        "crop": "Corn",
        "disease_name": "Northern Corn Leaf Blight (Exserohilum turcicum)",
        "symptoms": "Long, cigar-shaped, elliptical grey-green to tan lesions on lower leaves progressing upwards.",
        "cause": "Exserohilum turcicum fungus favored by wet, cool conditions and prolonged leaf wetness.",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Trichoderma harzianum @ 5g/L or Bordeaux mixture 1% (copper sulphate + lime).",
            chemical_backup="Foliar spray of Mancozeb 75% WP @ 2.5g/L or Propiconazole @ 1ml/L.",
            prevention_tips=[
                "Use resistant hybrid varieties.",
                "Increase planting row width to improve sunlight penetration and leaf drying."
            ],
            dosages="Repeat spray after 14 days if wet weather persists."
        )
    },
    "Corn_Healthy": {
        "crop": "Corn",
        "disease_name": "Healthy Corn / Maize Plant",
        "symptoms": "Robust broad green foliage, sturdy stalks, clear leaf veins without necrotic patches.",
        "cause": "Sound agronomic management and adequate soil moisture.",
        "treatment": TreatmentDetail(
            organic_remedy="No curative treatment needed. Continue balanced organic fertilization.",
            chemical_backup="None required.",
            prevention_tips=[
                "Ensure earthing-up at knee-high stage to prevent lodging.",
                "Monitor for fall armyworm on whorl leaves."
            ],
            dosages="Preventive neem spray @ 3ml/L if minor pests appear."
        )
    },

    # ── POTATO ──
    "Potato_Early_Blight": {
        "crop": "Potato",
        "disease_name": "Early Blight (Alternaria solani)",
        "symptoms": "Target-board circular spots with concentric rings surrounded by a narrow chlorotic halo on older foliage.",
        "cause": "Alternaria solani fungus surviving in soil and Solanaceous debris, triggered by alternating wet and dry spells.",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Copper Octanoate (copper soap) @ 3ml/L or Pseudomonas fluorescens @ 5g/L.",
            chemical_backup="Foliar spray of Chlorothalonil 75% WP @ 2g/L or Mancozeb 75% WP @ 2g/L.",
            prevention_tips=[
                "Drip irrigation instead of overhead sprinklers to prevent leaf wetting.",
                "Mulch beds with straw to prevent fungal rain-splash from soil onto lower leaves.",
                "Maintain adequate nitrogen and potassium; stressed senescent leaves succumb first."
            ],
            dosages="Spray every 7-10 days starting when lower leaves show initial target rings."
        )
    },
    "Potato_Late_Blight": {
        "crop": "Potato",
        "disease_name": "Late Blight (Phytophthora infestans)",
        "symptoms": "Water-soaked dark brown/purplish irregular blotches with white cottony mildew on undersides during moist mornings.",
        "cause": "Oomycete Phytophthora infestans, the most devastating potato pathogen, spreading rapidly during cool, cloudy, rain-soaked spells.",
        "treatment": TreatmentDetail(
            organic_remedy="Immediate spray of Bordeaux mixture 1% or Copper Oxychloride 50% WP @ 3g/L.",
            chemical_backup="Cymoxanil 8% + Mancozeb 64% WP @ 2g/L or Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L.",
            prevention_tips=[
                "Plant certified, disease-free seed tubers.",
                "Hill up soil well around stems to prevent spores washing into developing tubers.",
                "Destroy infected haulms 10 days before harvest to avoid tuber contamination."
            ],
            dosages="Spray coverage must be 100% on both leaf undersides and upper canopies."
        )
    },
    "Potato_Healthy": {
        "crop": "Potato",
        "disease_name": "Healthy Potato Plant",
        "symptoms": "Dense, crisp green foliage, uniform growth, clear stems with no necrotic patches.",
        "cause": "Optimal soil structure, balanced NPK, and cool hill/winter climate.",
        "treatment": TreatmentDetail(
            organic_remedy="No treatment required. Maintain regular tuber scouting.",
            chemical_backup="None required.",
            prevention_tips=[
                "Keep tubers well covered with soil to avoid greening.",
                "Stop irrigation 10 days prior to digging for firmer skin setting."
            ],
            dosages="Routine bio-stimulant or seaweed spray @ 2ml/L."
        )
    },

    # ── TOMATO ──
    "Tomato_Early_Blight": {
        "crop": "Tomato",
        "disease_name": "Tomato Early Blight (Alternaria solani)",
        "symptoms": "Dark brown to black spots with concentric rings ('target board' pattern) on older leaves, surrounded by yellow chlorotic halo.",
        "cause": "Fungal pathogen Alternaria solani surviving in plant debris; favored by warm temperatures (24-29°C) and alternating wet/dry periods.",
        "treatment": TreatmentDetail(
            organic_remedy="Foliar spray of Trichoderma harzianum @ 5g/L or fermented baking soda solution (5g/L + 2ml vegetable oil + 1ml liquid soap).",
            chemical_backup="Spray Chlorothalonil 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L at early lesion onset.",
            prevention_tips=[
                "Prune lower foliage touching the soil to eliminate soil splash spore transmission.",
                "Stake plants and use drip irrigation instead of overhead sprinklers.",
                "Practice a minimum 2-year crop rotation with non-solanaceous crops."
            ],
            dosages="Apply 400-500L/ha spray volume thoroughly wetting lower leaf surfaces."
        )
    },
    "Tomato_Late_Blight": {
        "crop": "Tomato",
        "disease_name": "Tomato Late Blight (Phytophthora infestans)",
        "symptoms": "Irregular water-soaked greasy brown lesions on leaves and stems; white fuzzy fungal growth on leaf undersides in high humidity.",
        "cause": "Oomycete Phytophthora infestans thriving in cool, cloudy, persistently wet weather (15-20°C, >90% RH).",
        "treatment": TreatmentDetail(
            organic_remedy="Copper hydroxide 77% WP @ 2.5g/L or Bordeaux mixture 1% foliar spray every 7 days during cool wet spells.",
            chemical_backup="Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/L or Dimethomorph 50% WP @ 1g/L.",
            prevention_tips=[
                "Ensure wide plant spacing (60x45cm) for rapid canopy drying.",
                "Destroy volunteer tomato and potato seedlings near the field.",
                "Avoid overhead irrigation during evening hours."
            ],
            dosages="Preventive spray prior to rain forecast; curative spray immediately upon seeing first lesion."
        )
    },
    "Tomato_Leaf_Curl": {
        "crop": "Tomato",
        "disease_name": "Tomato Leaf Curl Virus (ToLCV)",
        "symptoms": "Upward curling, puckering, crinkling and reduction of leaf size; stunted bushy growth with severe flower dropping.",
        "cause": "Begomovirus transmitted persistently by the whitefly vector (Bemisia tabaci).",
        "treatment": TreatmentDetail(
            organic_remedy="Foliar spray of 10,000 ppm Azadirachtin (Neem formulation) @ 2ml/L or Verticillium lecanii entomopathogenic fungus @ 5g/L.",
            chemical_backup="Spray Diafenthiuron 50% WP @ 1g/L or Acetamiprid 20% SP @ 0.3g/L to eliminate whitefly populations.",
            prevention_tips=[
                "Erect yellow sticky traps (15-20 traps/acre) at canopy height to trap whiteflies.",
                "Grow 2-3 border rows of maize or sorghum as a physical barrier against whitefly migration.",
                "Rogue out and destroy infected plants showing curl symptoms immediately."
            ],
            dosages="Neem oil: 5ml/L spray every 7 days during vegetative growth stage."
        )
    },
    "Tomato_Healthy": {
        "crop": "Tomato",
        "disease_name": "Healthy Tomato Plant",
        "symptoms": "Vigorous green compound leaves, robust stems, strong flowering clusters with no necrotic spots or leaf distortion.",
        "cause": "Optimal nutrient management, adequate trellis support, and whitefly-free microclimate.",
        "treatment": TreatmentDetail(
            organic_remedy="Continue weekly preventive bio-tonic spray (Panchagavya 3% or seaweed extract 2ml/L).",
            chemical_backup="None required.",
            prevention_tips=[
                "Maintain uniform soil moisture to prevent blossom end rot.",
                "Keep yellow sticky traps active to monitor vector presence."
            ],
            dosages="Maintain balanced NPK fertigation schedule."
        )
    },

    # ── COTTON ──
    "Cotton_Bacterial_Blight": {
        "crop": "Cotton",
        "disease_name": "Cotton Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)",
        "symptoms": "Small, dark brown to black angular lesions restricted by leaf veinlets; water-soaked spots coalescing into 'black arm' on petioles.",
        "cause": "Seed-borne and debris-borne bacterium Xanthomonas citri entering stomata during warm, stormy, humid weather.",
        "treatment": TreatmentDetail(
            organic_remedy="Foliar spray of Copper Oxychloride 50% WP @ 2.5g/L combined with Streptomycin sulphate (100 ppm) or fresh cow urine 10%.",
            chemical_backup="Copper Oxychloride @ 3g/L + Streptocycline @ 0.1g/L (1g in 10L water).",
            prevention_tips=[
                "Acid delint seeds with sulfuric acid (100ml/kg seed) followed by Pseudomonas seed treatment.",
                "Plow down infected crop residue immediately after harvest.",
                "Avoid excessive vegetative density."
            ],
            dosages="Spray 500L/ha spray solution covering both sides of leaves."
        )
    },
    "Cotton_Leaf_Curl": {
        "crop": "Cotton",
        "disease_name": "Cotton Leaf Curl Virus (CLCuV)",
        "symptoms": "Upward or downward curling of leaf margins, vein thickening, and enation (leaf-like outgrowths) on leaf undersides.",
        "cause": "Cotton leaf curl virus transmitted by the silverleaf whitefly (Bemisia tabaci).",
        "treatment": TreatmentDetail(
            organic_remedy="Spray Neem Seed Kernel Extract (NSKE 5%) or fish oil rosin soap @ 20g/L against whitefly nymphs.",
            chemical_backup="Spray Pyriproxyfen 10% EC @ 2ml/L or Flonicamid 50% WG @ 0.3g/L for whitefly control.",
            prevention_tips=[
                "Plant certified CLCuV-tolerant hybrids.",
                "Eradicate weed hosts like Abutilon indicum and Parthenium from field borders.",
                "Install yellow sticky traps (20/acre) to monitor whitefly vector thresholds."
            ],
            dosages="Spray twice at 10-day interval during peak whitefly activity."
        )
    },
    "Cotton_Healthy": {
        "crop": "Cotton",
        "disease_name": "Healthy Cotton Plant",
        "symptoms": "Broad, clean, deep-green lobed leaves with upright monopodial structure and healthy square/boll formation.",
        "cause": "Balanced boron and magnesium levels, well-drained black soil, and pest-managed canopy.",
        "treatment": TreatmentDetail(
            organic_remedy="Apply magnesium sulfate (1%) and 19:19:19 foliar spray for optimal boll development.",
            chemical_backup="None required.",
            prevention_tips=[
                "Scout weekly for sucking pests (jassids, whiteflies, thrips).",
                "Ensure proper drainage in black cotton soils to prevent waterlogging."
            ],
            dosages="Preventive neem spray: 5ml/L at 15-day intervals."
        )
    }
}


def get_disease_info(crop: str, disease_key: str) -> Optional[Dict[str, any]]:
    """Retrieve disease pathology and treatment data."""
    # Direct lookup
    if disease_key in DISEASE_KNOWLEDGE:
        return DISEASE_KNOWLEDGE[disease_key]

    # Normalize key search (e.g. "Rice_Blast" vs "Blast")
    for key, info in DISEASE_KNOWLEDGE.items():
        if info["crop"].lower() == crop.lower():
            if disease_key.lower() in key.lower() or key.lower() in disease_key.lower():
                return info

    # Fallback to healthy profile for crop
    healthy_key = f"{crop.title()}_Healthy"
    if healthy_key in DISEASE_KNOWLEDGE:
        return DISEASE_KNOWLEDGE[healthy_key]

    # Universal default
    return {
        "crop": crop,
        "disease_name": disease_key,
        "symptoms": "Visual leaf discoloration or lesion observed on leaf blade.",
        "cause": "Suspected fungal, bacterial, or physiological disturbance.",
        "treatment": TreatmentDetail(
            organic_remedy="Apply Neem oil (5ml/L) or Trichoderma viride (5g/L) as broad-spectrum eco-friendly remedy.",
            chemical_backup="Apply broad-spectrum Mancozeb 75% WP @ 2g/L if infection rapidly advances.",
            prevention_tips=["Remove affected leaves", "Avoid overhead wetting", "Ensure balanced soil nutrition"],
            dosages="Spray 500L/ha early morning."
        )
    }


def list_supported_crops_and_diseases() -> List[Dict[str, any]]:
    """Return dictionary of all supported crops and detectable pathologies."""
    crops_map: Dict[str, List[str]] = {}
    for key, info in DISEASE_KNOWLEDGE.items():
        c = info["crop"]
        d = info["disease_name"]
        crops_map.setdefault(c, []).append(d)
    return [{"crop": c, "diseases": d_list} for c, d_list in crops_map.items()]
