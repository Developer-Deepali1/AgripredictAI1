"""
Chatbot Request/Response Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ChatRequest(BaseModel):
    """Request schema for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    language: str = Field(default="en", description="Language code: en, hi, od")
    session_id: Optional[str] = Field(default=None, min_length=1, max_length=100, description="Session identifier")


class StructuredCropData(BaseModel):
    """Structured crop prediction data"""
    crop: str
    state: Optional[str] = None
    predicted_price: Optional[float] = None
    demand_level: Optional[str] = None   # LOW / MEDIUM / HIGH
    risk_level: Optional[str] = None     # LOW / MEDIUM / HIGH / CRITICAL
    profitability: Optional[float] = None  # 0-100
    confidence: Optional[float] = None   # 0-1
    trend: Optional[str] = None          # UP / DOWN / STABLE
    explanation: Optional[str] = None


class ComparisonEntry(BaseModel):
    """Single crop entry in comparison"""
    crop: str
    predicted_price: float
    demand_level: str
    risk_level: str
    profitability: float
    is_recommended: bool = False


class ChatResponse(BaseModel):
    """Response schema for chat endpoint"""
    reply_text: str
    reply_audio_url: Optional[str] = None
    structured_data: Optional[StructuredCropData] = None
    comparison: Optional[List[ComparisonEntry]] = None
    suggestions: List[str] = []
    detected_language: str = "en"
    session_id: str
    request_id: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[str] = None


class VoiceChatResponse(ChatResponse):
    """Response for voice chat endpoint"""
    transcribed_text: str = ""
    transcription_confidence: float = 0.0


class ConversationTurn(BaseModel):
    """A single conversation turn"""
    role: str   # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None


class ConversationHistoryResponse(BaseModel):
    """Conversation history response"""
    session_id: str
    turns: List[ConversationTurn]
    total_turns: int
