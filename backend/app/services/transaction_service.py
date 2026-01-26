from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models import Transaction, TransactionType
from app.schemas.transaction import TransactionCreate, TransactionUpdate


from datetime import timezone


def list_transactions(
    db: Session,
    user_id: int,
    *,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    category: str | None = None,
    transaction_type: TransactionType | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Transaction]:
    # Hard safety cap (finance apps must never allow unlimited scans)
    limit = min(limit, 500)

    statement = select(Transaction).where(Transaction.user_id == user_id)

    if start_at:
        if start_at.tzinfo is None:
            start_at = start_at.replace(tzinfo=timezone.utc)
        statement = statement.where(Transaction.occurred_at >= start_at)

    if end_at:
        if end_at.tzinfo is None:
            end_at = end_at.replace(tzinfo=timezone.utc)
        statement = statement.where(Transaction.occurred_at <= end_at)

    if category:
        statement = statement.where(Transaction.category == category)

    if transaction_type:
        statement = statement.where(
            Transaction.transaction_type == transaction_type
        )

    statement = (
        statement
        .order_by(Transaction.occurred_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def create_transaction(db: Session, user_id: int, tx_in: TransactionCreate) -> Transaction:
    transaction = Transaction(
        user_id=user_id,
        category=tx_in.category,
        amount=tx_in.amount,
        currency=tx_in.currency.upper(),
        transaction_type=tx_in.transaction_type,
        occurred_at=tx_in.occurred_at.replace(tzinfo=timezone.utc),
        note=tx_in.note,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def get_transaction(db: Session, user_id: int, transaction_id: int) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction


def update_transaction(
    db: Session, user_id: int, transaction_id: int, tx_in: TransactionUpdate
) -> Transaction:
    transaction = get_transaction(db, user_id, transaction_id)
    update_data = tx_in.model_dump(exclude_unset=True)
    if "currency" in update_data and update_data["currency"]:
        update_data["currency"] = update_data["currency"].upper()
    for field, value in update_data.items():
        setattr(transaction, field, value)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, user_id: int, transaction_id: int) -> None:
    transaction = get_transaction(db, user_id, transaction_id)
    db.delete(transaction)
    db.commit()


def month_bounds(reference: datetime) -> tuple[datetime, datetime]:
    start = reference.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


def monthly_summary(db: Session, user_id: int, reference: datetime) -> tuple[Decimal, Decimal]:
    start, end = month_bounds(reference)
    statement = (
        select(Transaction.transaction_type, func.coalesce(
            func.sum(Transaction.amount), 0))
        .where(
            and_(
                Transaction.user_id == user_id,
                Transaction.occurred_at >= start,
                Transaction.occurred_at < end,
            )
        )
        .group_by(Transaction.transaction_type)
    )
    totals = {row[0]: Decimal(row[1]) for row in db.execute(statement)}
    total_income = totals.get(TransactionType.INCOME, Decimal("0"))
    total_expense = totals.get(TransactionType.EXPENSE, Decimal("0"))
    return total_income, total_expense


def top_expense_categories(
    db: Session, user_id: int, reference: datetime, limit: int = 5
) -> list[tuple[str, Decimal]]:
    start, end = month_bounds(reference)
    statement = (
        select(Transaction.category, func.coalesce(
            func.sum(Transaction.amount), 0))
        .where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.EXPENSE,
                Transaction.occurred_at >= start,
                Transaction.occurred_at < end,
            )
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
    )
    return [(row[0], Decimal(row[1])) for row in db.execute(statement).all()]
