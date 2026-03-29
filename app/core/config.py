"""
Application configuration settings
"""
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_VERSION: str = "1.0.0"
    PROJECT_NAME: str = "AgriPredictAI"
    
    # Server Settings
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./agripredict.db"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Security Settings
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # External Services
    WEATHER_API_KEY: str = ""
    MARKET_DATA_API_KEY: str = ""

    # Chatbot / Voice / Translation Settings
    OPENAI_API_KEY: str = ""
    GOOGLE_TRANSLATE_API_KEY: str = ""
    ENABLE_VOICE: bool = True
    ENABLE_MULTILINGUAL: bool = True
    CONVERSATION_MEMORY_SIZE: int = 5
    DEFAULT_LANGUAGE: str = "en"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
