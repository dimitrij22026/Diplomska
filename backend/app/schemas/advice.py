from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AdviceRequest(BaseModel):
    question: str = Field(min_length=5, max_length=500)
    conversation_id: Optional[str] = None  # If None, creates new conversation


class AdviceRead(BaseModel):
    id: int
    conversation_id: str
    prompt: str
    response: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(BaseModel):
    conversation_id: str
    title: str  # First prompt truncated
    message_count: int
    last_message_at: datetime

    model_config = ConfigDict(from_attributes=True)
