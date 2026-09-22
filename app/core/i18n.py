"""
Pan-Indian Regional Languages Support (10 Languages)
Provides localized terminology, language mapping, and translation helpers.
"""
from typing import Dict, List, Optional

SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "en": {"name": "English", "native": "English", "code": "en"},
    "hi": {"name": "Hindi", "native": "हिन्दी", "code": "hi"},
    "od": {"name": "Odia", "native": "ଓଡ଼ିଆ", "code": "or"},
    "bn": {"name": "Bengali", "native": "বাংলা", "code": "bn"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "code": "gu"},
    "mr": {"name": "Marathi", "native": "मराठी", "code": "mr"},
    "te": {"name": "Telugu", "native": "తెలుగు", "code": "te"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "code": "ta"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "code": "kn"},
    "ml": {"name": "Malayalam", "native": "മലയാളം", "code": "ml"},
}

# Key UI phrases in 10 languages
UI_DICTIONARY: Dict[str, Dict[str, str]] = {
    "dashboard": {
        "en": "Dashboard", "hi": "डैशबोर्ड", "od": "ଡ୍ୟାସବୋର୍ଡ",
        "bn": "ড্যাশবোর্ড", "gu": "ડેશબોર્ડ", "mr": "डॅशबोर्ड",
        "te": "డాష్‌బోర్డ్", "ta": "டாஷ்போர்டு", "kn": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ml": "ഡാഷ്‌ബോർഡ്"
    },
    "crop_doctor": {
        "en": "Crop Doctor (Disease Scanner)",
        "hi": "फसल डॉक्टर (रोग पहचान)",
        "od": "ଫସଲ ଡାକ୍ତର (ରୋଗ ଚିହ୍ନଟ)",
        "bn": "ফসল ডাক্তার (রোগ সনাক্তকরণ)",
        "gu": "પાક ડૉક્ટર (રોગ નિદાન)",
        "mr": "पीक डॉक्टर (रोग निदान)",
        "te": "పంట డాక్టర్ (వ్యాధి గుర్తింపు)",
        "ta": "பயிர் மருத்துவர் (நோய் கண்டறிதல்)",
        "kn": "ಬೆಳೆ ವೈದ್ಯ (ರೋಗ ಪತ್ತೆ)",
        "ml": "വിള ഡോക്ടർ (രോഗനിർണയം)"
    },
    "smart_irrigation": {
        "en": "Smart Irrigation",
        "hi": "स्मार्ट सिंचाई",
        "od": "ସ୍ମାର୍ଟ ଜଳସେଚନ",
        "bn": "স্মার্ট সেচ",
        "gu": "સ્માર્ટ સિંચાઈ",
        "mr": "स्मार्ट सिंचन",
        "te": "స్మార్ట్ సాగునీరు",
        "ta": "ஸ்மார்ட் நீர்ப்பாசனம்",
        "kn": "ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ",
        "ml": "സ്മാർട്ട് ജലസേചനം"
    },
    "carbon_footprint": {
        "en": "Carbon Footprint & Eco-Score",
        "hi": "कार्बन उत्सर्जन व इको-स्कोर",
        "od": "କାର୍ବନ ଉତ୍ସର୍ଜନ ଓ ଇକୋ-ସ୍କୋର",
        "bn": "কার্বন নিঃসরণ ও ইকো-স্কোর",
        "gu": "કાર્બન ઉત્સર્જન અને ઇકો-સ્કોર",
        "mr": "कार्बन उत्सर्जन व इको-स्कोअर",
        "te": "కార్బన్ ఉద్గారాలు & ఎకో-స్కోర్",
        "ta": "கார்பன் தடம் & சுற்றுச்சூழல் மதிப்பெண்",
        "kn": "ಕಾರ್ಬನ್ ಹೊರಸೂಸುವಿಕೆ ಮತ್ತು ಇಕೋ-ಸ್ಕೋರ್",
        "ml": "കാർബൺ കാൽപ്പാടും ഇക്കോ-സ്കോറും"
    },
    "upload_leaf_image": {
        "en": "Upload Leaf Image",
        "hi": "पत्ती की तस्वीर अपलोड करें",
        "od": "ପତ୍ରର ଫଟୋ ଅପଲୋଡ଼ କରନ୍ତୁ",
        "bn": "পাতার ছবি আপলোড করুন",
        "gu": "પાંદડાની તસવીર અપલોડ કરો",
        "mr": "पानाचे छायाचित्र अपलोड करा",
        "te": "ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి",
        "ta": "இலை படத்தை பதிவேற்றவும்",
        "kn": "ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
        "ml": "ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക"
    },
}


def get_supported_languages_list() -> List[Dict[str, str]]:
    """Return list of supported languages."""
    return [
        {"code": k, "name": v["name"], "native_name": v["native"]}
        for k, v in SUPPORTED_LANGUAGES.items()
    ]


def get_ui_text(phrase_key: str, lang_code: str = "en") -> str:
    """Retrieve translated phrase with fallback to English."""
    phrase_dict = UI_DICTIONARY.get(phrase_key, {})
    return phrase_dict.get(lang_code, phrase_dict.get("en", phrase_key))
