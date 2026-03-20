from datetime import datetime

from pydantic import BaseModel, Field


class AdminStepUpRequest(BaseModel):
    password: str | None = Field(default=None, min_length=8, max_length=72)
    pin: str | None = Field(default=None, min_length=4, max_length=32)


class AdminStepUpResponse(BaseModel):
    step_up_token: str
    expires_at: datetime


class AdminTierBreakdown(BaseModel):
    free: int
    pro: int
    premium: int


class AdminStatsResponse(BaseModel):
    total_users: int
    tiers: AdminTierBreakdown
    system_health: str
    api_latency_ms: float
