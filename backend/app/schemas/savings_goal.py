from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SavingsGoalBase(BaseModel):
    name: str = Field(max_length=128)
    target_amount: Decimal = Field(gt=Decimal("0"))
    current_amount: Decimal = Field(default=Decimal("0"), ge=Decimal("0"))
    icon: str = Field(default="🎯", max_length=16)


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=128)
    target_amount: Decimal | None = Field(default=None, gt=Decimal("0"))
    current_amount: Decimal | None = Field(default=None, ge=Decimal("0"))
    icon: str | None = Field(default=None, max_length=16)


class SavingsGoalRead(SavingsGoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
