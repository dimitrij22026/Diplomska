from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import SavingsGoal
from app.schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate


def list_savings_goals(db: Session, user_id: int) -> list[SavingsGoal]:
    statement = select(SavingsGoal).where(
        SavingsGoal.user_id == user_id).order_by(SavingsGoal.created_at.desc())
    return list(db.scalars(statement).all())


def create_savings_goal(db: Session, user_id: int, goal_in: SavingsGoalCreate) -> SavingsGoal:
    goal = SavingsGoal(
        user_id=user_id,
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
        icon=goal_in.icon,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_savings_goal(db: Session, user_id: int, goal_id: int) -> SavingsGoal:
    goal = db.get(SavingsGoal, goal_id)
    if not goal or goal.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")
    return goal


def update_savings_goal(db: Session, user_id: int, goal_id: int, goal_in: SavingsGoalUpdate) -> SavingsGoal:
    goal = get_savings_goal(db, user_id, goal_id)
    for field, value in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def delete_savings_goal(db: Session, user_id: int, goal_id: int) -> None:
    goal = get_savings_goal(db, user_id, goal_id)
    db.delete(goal)
    db.commit()
