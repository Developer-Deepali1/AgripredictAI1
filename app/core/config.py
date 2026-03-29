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
    # NOTE: The wildcard "*" below is intentional for local development convenience.
    # Override CORS_ORIGINS via environment variable in production to restrict allowed origins.
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*",  # Allow all in dev; restrict in production via env var
    ]
    
    # Security Settings
    # A default development key is provided so the app starts without a .env file.
    # Override SECRET_KEY in .env (or environment) with a strong random value for production.
    SECRET_KEY: str = Field(
        default="agripredict-dev-secret-key-change-in-production-32chars",
        min_length=32,
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # External Services
    WEATHER_API_KEY: str = ""
    MARKET_DATA_API_KEY: str = ""

    # Email (Gmail SMTP)
    GMAIL_EMAIL: str = ""
    GMAIL_APP_PASSWORD: str = ""

    # SMS – Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # SMS – Fast2SMS (India)
    FAST2SMS_API_KEY: str = ""
    FAST2SMS_ROUTE: str = "q"

    # Choose SMS provider: "twilio" | "fast2sms"
    SMS_PROVIDER: str = "twilio"

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
