"""
Application constants
"""

# Supported Crops
SUPPORTED_CROPS = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane",
    "Potato", "Onion", "Tomato", "Cabbage", "Carrot"
]

# Risk Levels
RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

# Market Conditions
MARKET_CONDITIONS = ["BULLISH", "BEARISH", "NEUTRAL", "VOLATILE"]

# Alert Types
ALERT_TYPES = ["PRICE_DROP", "PRICE_SPIKE", "WEATHER_WARNING", "DISEASE_RISK", "MARKET_ALERT"]

# Feasibility Score Thresholds
FEASIBILITY_THRESHOLD_EXCELLENT = 0.8
FEASIBILITY_THRESHOLD_GOOD = 0.6
FEASIBILITY_THRESHOLD_FAIR = 0.4
FEASIBILITY_THRESHOLD_POOR = 0.2

# Supported Languages for Chatbot
SUPPORTED_CHAT_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "od": "Odia",
}
