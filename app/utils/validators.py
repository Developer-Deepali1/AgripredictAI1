"""
Data validation utilities
"""

def validate_crop(crop: str):
    """Validate crop name"""
    from app.core.constants import SUPPORTED_CROPS
    return crop in SUPPORTED_CROPS

def validate_coordinates(latitude: float, longitude: float):
    """Validate geographic coordinates"""
    return -90 <= latitude <= 90 and -180 <= longitude <= 180

def validate_area(area: float):
    """Validate farm area"""
    return area > 0
