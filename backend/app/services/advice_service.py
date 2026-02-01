from datetime import datetime
from decimal import Decimal
from typing import Any

import httpx

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import AdviceEntry, User
from app.schemas.advice import AdviceRequest
from app.schemas.insight import CategoryBreakdown, MonthlyInsight
from app.services import transaction_service


def compose_summary(
    total_income: Decimal,
    total_expense: Decimal,
    balance: Decimal,
    categories: list[tuple[str, Decimal]],
    month_label: str,
) -> MonthlyInsight:
    return MonthlyInsight(
        month=month_label,
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
        top_expense_categories=[
            CategoryBreakdown(category=category, amount=amount) for category, amount in categories
        ],
    )


def _summary_text(summary: MonthlyInsight) -> str:
    top_categories = ", ".join(
        f"{item.category}: {item.amount:.2f}" for item in summary.top_expense_categories
    ) or "Нема доволно податоци"
    return (
        f"За {summary.month} имате вкупно приходи од {summary.total_income:.2f} и трошоци од "
        f"{summary.total_expense:.2f}. Балансот изнесува {summary.balance:.2f}. "
        f"Најголем дел од трошоците се во категориите: {top_categories}."
    )


def _fallback_response(summary: MonthlyInsight, question: str, user: User) -> str:
    assistant_name = settings.AI_ASSISTANT_NAME
    summary_text = _summary_text(summary)
    question_lower = question.lower()

    if "како се викам" in question_lower:
        name = user.full_name or user.email
        return f"[{assistant_name}] Вашето име е: {name}. {summary_text}"

    if "трансак" in question_lower and ("додадам" in question_lower or "креирам" in question_lower):
        return (
            f"[{assistant_name}] За да додадете нова трансакција, одете на „Трансакции“ и пополнете "
            f"категорија, износ и тип (приход/трошок). Потоа притиснете „Зачувај трансакција“. "
            f"{summary_text}"
        )

    if "заштед" in question_lower:
        return (
            f"[{assistant_name}] За повеќе заштеда, прво автоматизирајте трансфер на фиксна сума "
            f"на почеток на месецот, па поставете лимити за најскапите категории. "
            f"{summary_text}"
        )

    return (
        f"[{assistant_name}] {summary_text} Прашањето што го поставивте: '{question}'. "
        f"Предлагам да поставите лимит за најголемите категории и да следите месечни цели за заштеда."
    )


def _build_ai_prompt(summary: MonthlyInsight, question: str, user: User, historical_data: dict | None = None) -> tuple[str, str]:
    """Build system and user prompts for AI."""
    summary_text = _summary_text(summary)
    user_name = user.full_name or user.email

    system_prompt = (
        "You are FinMate, a friendly and knowledgeable personal finance assistant. "
        "You help users manage their money, budget effectively, and achieve their financial goals. "
        "Always respond in the same language the user asks in (Macedonian or English). "
        "Be concise, practical, and provide actionable advice. "
        "Use the user's financial data to give personalized recommendations. "
        "You have access to both current month data AND historical data from previous months. "
        "IMPORTANT: When the user asks about all expenses or previous months, analyze ALL the historical data provided below, not just current month. "
        "The historical data includes all-time totals and monthly breakdowns - use this data to answer questions about past spending."
    )

    # Build historical context
    historical_context = ""
    if historical_data:
        # All-time summary
        all_time = historical_data.get("all_time", {})
        if all_time:
            historical_context += (
                f"\n\n=== ALL-TIME FINANCIAL SUMMARY ===\n"
                f"- Total Income (all time): {all_time.get('income', 0):.2f}\n"
                f"- Total Expenses (all time): {all_time.get('expense', 0):.2f}\n"
                f"- Net Balance (all time): {all_time.get('balance', 0):.2f}"
            )

        # All-time categories
        all_time_categories = historical_data.get("all_time_categories", [])
        if all_time_categories:
            cats = ", ".join(f"{cat}: {amt:.2f}" for cat,
                             amt in all_time_categories[:5])
            historical_context += f"\n- Top Expense Categories (all time): {cats}"
        else:
            historical_context += f"\n- Top Expense Categories (all time): No expenses recorded"

        # Monthly breakdown
        monthly = historical_data.get("monthly_breakdown", [])
        if monthly:
            historical_context += "\n\n=== MONTHLY HISTORY (last 6 months) ==="
            has_any_data = False
            for m in monthly:
                income = m['income']
                expense = m['expense']
                balance = income - expense
                if income > 0 or expense > 0:
                    has_any_data = True
                historical_context += f"\n- {m['month']}: Income {income:.2f}, Expenses {expense:.2f}, Balance {balance:.2f}"
            if not has_any_data:
                historical_context += "\n(No transactions recorded in these months)"

        # Recent transactions list
        recent_transactions = historical_data.get("recent_transactions", [])
        if recent_transactions:
            historical_context += "\n\n=== RECENT TRANSACTIONS (last 20) ==="
            for tx in recent_transactions:
                tx_type = "Income" if tx['type'] == 'INCOME' else "Expense"
                historical_context += f"\n- {tx['date']}: {tx_type} - {tx['category']}: {tx['amount']:.2f} {tx.get('note', '')}"

    user_prompt = (
        f"User: {user_name}\n"
        f"Current Month Summary: {summary_text}"
        f"{historical_context}\n\n"
        f"Question: {question}\n\n"
        "Please provide helpful, specific financial advice based on this context. "
        "If the user asks about previous months or historical data, use the monthly history provided."
    )

    return system_prompt, user_prompt


def _gemini_response(summary: MonthlyInsight, question: str, user: User, historical_data: dict | None = None) -> str | None:
    """Get response from Google Gemini API (FREE)."""
    print(
        f"DEBUG: Checking Gemini API key: {'SET' if settings.GOOGLE_GEMINI_API_KEY else 'NOT SET'}")
    if not settings.GOOGLE_GEMINI_API_KEY:
        print("DEBUG: No Gemini API key found, skipping Gemini")
        return None

    print(f"DEBUG: Calling Gemini API...")
    system_prompt, user_prompt = _build_ai_prompt(
        summary, question, user, historical_data)

    # Gemini uses a combined prompt format
    full_prompt = f"{system_prompt}\n\n{user_prompt}"

    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 500,
            "topP": 0.95,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GOOGLE_GEMINI_API_KEY}",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

            # Extract text from Gemini response
            candidates = data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {}).get("parts", [])
                if content:
                    text = content[0].get("text", "")
                    if text:
                        return f"[{settings.AI_ASSISTANT_NAME}] {text.strip()}"
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None
    return None


def _groq_response(summary: MonthlyInsight, question: str, user: User, historical_data: dict | None = None) -> str | None:
    """Get response from Groq API (FREE - 30 req/min)."""
    print(
        f"DEBUG: Checking Groq API key: {'SET' if settings.GROQ_API_KEY else 'NOT SET'}")
    if not settings.GROQ_API_KEY:
        print("DEBUG: No Groq API key found, skipping Groq")
        return None

    print("DEBUG: Calling Groq API...")
    system_prompt, user_prompt = _build_ai_prompt(
        summary, question, user, historical_data)

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 500,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            content = data.get("choices", [{}])[0].get(
                "message", {}).get("content")
            if content:
                print(f"DEBUG: Groq response received successfully")
                return f"[{settings.AI_ASSISTANT_NAME}] {content.strip()}"
    except Exception as e:
        print(f"Groq API error: {e}")
        return None
    return None


def _openai_response(summary: MonthlyInsight, question: str, user: User, historical_data: dict | None = None) -> str | None:
    """Get response from OpenAI API (paid)."""
    if not settings.OPENAI_API_KEY:
        return None

    system_prompt, user_prompt = _build_ai_prompt(
        summary, question, user, historical_data)

    payload: dict[str, Any] = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 500,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            content = data.get("choices", [{}])[0].get(
                "message", {}).get("content")
            if content:
                return f"[{settings.AI_ASSISTANT_NAME}] {content.strip()}"
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None
    return None


def generate_advice(db: Session, user: User, request: AdviceRequest) -> AdviceEntry:
    import uuid

    reference = datetime.now()
    total_income, total_expense = transaction_service.monthly_summary(
        db, user.id, reference)
    categories = transaction_service.top_expense_categories(
        db, user.id, reference)
    balance = total_income - total_expense
    summary = compose_summary(
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
        categories=categories,
        month_label=reference.strftime("%Y-%m"),
    )

    # Gather historical data for AI context
    all_time_income, all_time_expense = transaction_service.all_time_summary(
        db, user.id)
    all_time_categories = transaction_service.all_time_expense_categories(
        db, user.id)
    monthly_breakdown = transaction_service.monthly_breakdown(
        db, user.id, months=6)

    # Get recent transactions for more context
    recent_txs = transaction_service.list_transactions(db, user.id, limit=20)
    recent_transactions = [
        {
            "date": tx.occurred_at.strftime("%Y-%m-%d"),
            "type": tx.transaction_type.value,
            "category": tx.category,
            "amount": tx.amount,
            "note": tx.note or "",
        }
        for tx in recent_txs
    ]

    historical_data = {
        "all_time": {
            "income": all_time_income,
            "expense": all_time_expense,
            "balance": all_time_income - all_time_expense,
        },
        "all_time_categories": all_time_categories,
        "monthly_breakdown": monthly_breakdown,
        "recent_transactions": recent_transactions,
    }

    # Debug logging
    print(f"DEBUG: Historical data for user {user.id}:")
    print(f"  All-time income: {all_time_income}, expense: {all_time_expense}")
    print(f"  All-time categories: {all_time_categories}")
    print(f"  Monthly breakdown: {monthly_breakdown}")
    print(f"  Recent transactions count: {len(recent_transactions)}")

    # Try Groq first (free, fast), then Gemini, then OpenAI, then fallback
    response = _groq_response(summary, request.question, user, historical_data)
    if not response:
        response = _gemini_response(
            summary, request.question, user, historical_data)
    if not response:
        response = _openai_response(
            summary, request.question, user, historical_data)
    if not response:
        response = _fallback_response(summary, request.question, user)

    # Use provided conversation_id or generate new one
    conversation_id = request.conversation_id or str(uuid.uuid4())

    advice = AdviceEntry(
        user_id=user.id,
        conversation_id=conversation_id,
        prompt=request.question,
        response=response
    )
    db.add(advice)
    db.commit()
    db.refresh(advice)
    return advice


def list_advice(db: Session, user_id: int, limit: int = 20) -> list[AdviceEntry]:
    statement = (
        select(AdviceEntry)
        .where(AdviceEntry.user_id == user_id)
        .order_by(AdviceEntry.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def list_conversations(db: Session, user_id: int) -> list[dict]:
    """Get list of conversation summaries for a user."""
    from sqlalchemy import func as sql_func, distinct

    # Get all unique conversations with their first message and count
    subquery = (
        select(
            AdviceEntry.conversation_id,
            sql_func.min(AdviceEntry.id).label("first_id"),
            sql_func.max(AdviceEntry.created_at).label("last_message_at"),
            sql_func.count(AdviceEntry.id).label("message_count")
        )
        .where(AdviceEntry.user_id == user_id)
        .group_by(AdviceEntry.conversation_id)
        .subquery()
    )

    # Join to get the first prompt as title
    statement = (
        select(
            AdviceEntry.conversation_id,
            AdviceEntry.prompt,
            subquery.c.message_count,
            subquery.c.last_message_at
        )
        .join(subquery, AdviceEntry.id == subquery.c.first_id)
        .order_by(subquery.c.last_message_at.desc())
    )

    results = db.execute(statement).all()
    return [
        {
            "conversation_id": row.conversation_id,
            "title": row.prompt[:50] + "..." if len(row.prompt) > 50 else row.prompt,
            "message_count": row.message_count,
            "last_message_at": row.last_message_at
        }
        for row in results
    ]


def get_conversation(db: Session, user_id: int, conversation_id: str) -> list[AdviceEntry]:
    """Get all messages in a specific conversation."""
    statement = (
        select(AdviceEntry)
        .where(AdviceEntry.user_id == user_id)
        .where(AdviceEntry.conversation_id == conversation_id)
        .order_by(AdviceEntry.created_at.asc())
    )
    return list(db.scalars(statement).all())


def delete_conversation(db: Session, user_id: int, conversation_id: str) -> None:
    """Delete a specific conversation."""
    from sqlalchemy import delete
    statement = (
        delete(AdviceEntry)
        .where(AdviceEntry.user_id == user_id)
        .where(AdviceEntry.conversation_id == conversation_id)
    )
    db.execute(statement)
    db.commit()


def clear_advice(db: Session, user_id: int) -> None:
    """Delete all advice entries for a user."""
    from sqlalchemy import delete
    statement = delete(AdviceEntry).where(AdviceEntry.user_id == user_id)
    db.execute(statement)
    db.commit()
