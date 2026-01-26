from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import BudgetGoal
from app.schemas.budget import BudgetCreate, BudgetUpdate


def list_budgets(db: Session, user_id: int) -> list[BudgetGoal]:
    statement = select(BudgetGoal).where(
        BudgetGoal.user_id == user_id).order_by(BudgetGoal.created_at.desc())
    return list(db.scalars(statement).all())


def create_budget(db: Session, user_id: int, budget_in: BudgetCreate) -> BudgetGoal:
    budget = BudgetGoal(
        user_id=user_id,
        category=budget_in.category,
        limit_amount=budget_in.limit_amount,
        period=budget_in.period,
        starts_on=budget_in.starts_on,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def get_budget(db: Session, user_id: int, budget_id: int) -> BudgetGoal:
    budget = db.get(BudgetGoal, budget_id)
    if not budget or budget.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Budget goal not found")
    return budget


def update_budget(db: Session, user_id: int, budget_id: int, budget_in: BudgetUpdate) -> BudgetGoal:
    budget = get_budget(db, user_id, budget_id)
    for field, value in budget_in.model_dump(exclude_unset=True).items():
        setattr(budget, field, value)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, user_id: int, budget_id: int) -> None:
    budget = get_budget(db, user_id, budget_id)
    db.delete(budget)
    db.commit()
