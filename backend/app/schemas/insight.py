from decimal import Decimal

from pydantic import BaseModel, Field


class CategoryBreakdown(BaseModel):
    category: str
    amount: Decimal


class MonthlyInsight(BaseModel):
    month: str = Field(description="ISO YYYY-MM label")
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal
    top_expense_categories: list[CategoryBreakdown]
    # Previous month data for trend calculations
    prev_total_income: Decimal = Field(default=Decimal(
        "0"), description="Previous month total income")
    prev_total_expense: Decimal = Field(default=Decimal(
        "0"), description="Previous month total expense")
    # Carryover from previous month (leftover balance)
    carryover: Decimal = Field(default=Decimal(
        "0"), description="Balance carried over from previous month")
