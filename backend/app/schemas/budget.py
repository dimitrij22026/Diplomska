from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BudgetPeriod


class BudgetBase(BaseModel):
    category: str = Field(max_length=64)
    limit_amount: Decimal = Field(gt=Decimal("0"))
    period: BudgetPeriod = BudgetPeriod.MONTHLY
    starts_on: date


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category: str | None = Field(default=None, max_length=64)
    limit_amount: Decimal | None = Field(default=None, gt=Decimal("0"))
    period: BudgetPeriod | None = None
    starts_on: date | None = None


class BudgetRead(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
