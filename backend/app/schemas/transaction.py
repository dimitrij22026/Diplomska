from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TransactionType


class TransactionBase(BaseModel):
    category: str = Field(max_length=64)
    amount: Decimal = Field(gt=Decimal("0"))
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    transaction_type: TransactionType
    occurred_at: datetime
    note: str | None = Field(default=None, max_length=500)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    category: str | None = Field(default=None, max_length=64)
    amount: Decimal | None = Field(default=None, gt=Decimal("0"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    transaction_type: TransactionType | None = None
    occurred_at: datetime | None = None
    note: str | None = Field(default=None, max_length=500)


class TransactionRead(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
