"""
Chatbot-specific constants: supported languages, states, crop aliases.
"""

# Supported languages for multilingual chatbot
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "od": "Odia",
}

# Mapping of Indian state names (including common abbreviations / variants)
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh",
]

# State aliases / common spellings → canonical name
STATE_ALIASES: dict = {
    "orissa": "Odisha",
    "odisa": "Odisha",
    "up": "Uttar Pradesh",
    "mp": "Madhya Pradesh",
    "ap": "Andhra Pradesh",
    "tn": "Tamil Nadu",
    "wb": "West Bengal",
    "hp": "Himachal Pradesh",
    "j&k": "Jammu and Kashmir",
    "jk": "Jammu and Kashmir",
    "uk": "Uttarakhand",
    "uttaranchal": "Uttarakhand",
    "bombay": "Maharashtra",
    "madras": "Tamil Nadu",
    "calcutta": "West Bengal",
}

# Crop aliases → canonical names  (must match SUPPORTED_CROPS in core/constants.py)
CROP_ALIASES: dict = {
    "paddy": "Rice",
    "dhan": "Rice",
    "gehu": "Wheat",
    "makka": "Maize",
    "corn": "Maize",
    "kapas": "Cotton",
    "narma": "Cotton",
    "ganna": "Sugarcane",
    "alu": "Potato",
    "pyaz": "Onion",
    "tamatar": "Tomato",
    "band gobhi": "Cabbage",
    "gajar": "Carrot",
}

# Intent types recognised by the intent engine
INTENT_TYPES = [
    "price_query",        # "What is the price of rice?"
    "comparison",         # "Compare rice and wheat"
    "recommendation",     # "Which crop should I grow?"
    "risk_query",         # "What are the risks for cotton?"
    "profitability",      # "Is maize profitable?"
    "what_if",            # "What if I grow rice in Odisha?"
    "general",            # Catch-all
]

# Kharif / Rabi season months
KHARIF_MONTHS = [6, 7, 8, 9, 10]    # June – October
RABI_MONTHS   = [11, 12, 1, 2, 3]   # November – March
ZAID_MONTHS   = [3, 4, 5]            # March – May

# Demand levels
DEMAND_LEVELS = ["LOW", "MEDIUM", "HIGH"]
