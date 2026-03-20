from datetime import datetime, timezone
from time import perf_counter

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.core.security import create_access_token, token_expiration, verify_password
from app.models import User
from app.schemas import (
    AdminStatsResponse,
    AdminStepUpRequest,
    AdminStepUpResponse,
    AdminTierBreakdown,
    AdminUserUpdate,
    UserRead,
)
from app.services import user_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/step-up-verify", response_model=AdminStepUpResponse)
def step_up_verify(
    *,
    step_up_in: AdminStepUpRequest,
    current_admin: User = Depends(deps.get_current_admin_user),
) -> AdminStepUpResponse:
    has_password = bool(step_up_in.password)
    has_pin = bool(step_up_in.pin)

    if not has_password and not has_pin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password or admin PIN is required",
        )

    password_ok = False
    pin_ok = False

    if has_password and step_up_in.password:
        password_ok = verify_password(
            step_up_in.password, current_admin.hashed_password)

    if has_pin and step_up_in.pin and settings.ADMIN_STEP_UP_PIN:
        pin_ok = step_up_in.pin == settings.ADMIN_STEP_UP_PIN

    if not password_ok and not pin_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid step-up credentials",
        )

    expires_delta = token_expiration(
        minutes=settings.ADMIN_STEP_UP_TTL_MINUTES)
    expires_at = datetime.now(timezone.utc) + expires_delta
    step_up_token = create_access_token(
        current_admin.id,
        expires_delta,
        scopes=["admin_step_up"],
        email_verified=current_admin.is_email_verified,
        token_kind="admin_step_up",
    )
    return AdminStepUpResponse(step_up_token=step_up_token, expires_at=expires_at)


@router.get("/stats", response_model=AdminStatsResponse)
def admin_stats(
    *,
    db: Session = Depends(deps.get_db),
    _: User = Depends(deps.get_current_step_up_admin_user),
) -> AdminStatsResponse:
    total_users = db.scalar(select(func.count(User.id))) or 0
    free_count = db.scalar(select(func.count(User.id)).where(
        User.subscription_tier == "FREE")) or 0
    pro_count = db.scalar(select(func.count(User.id)).where(
        User.subscription_tier == "PRO")) or 0
    premium_count = db.scalar(select(func.count(User.id)).where(
        User.subscription_tier == "PREMIUM")) or 0

    start = perf_counter()
    db.execute(text("SELECT 1"))
    latency_ms = round((perf_counter() - start) * 1000, 2)

    return AdminStatsResponse(
        total_users=total_users,
        tiers=AdminTierBreakdown(
            free=free_count, pro=pro_count, premium=premium_count),
        system_health="Operational",
        api_latency_ms=latency_ms,
    )


@router.get("/users", response_model=list[UserRead])
def list_all_users(
    *,
    db: Session = Depends(deps.get_db),
    _: User = Depends(deps.get_current_step_up_admin_user),
) -> list[UserRead]:
    return user_service.list_users(db)


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user_admin_fields(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: AdminUserUpdate,
    current_admin: User = Depends(deps.get_current_step_up_admin_user),
) -> UserRead:
    user = user_service.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Prevent a user from accidentally removing their own admin access.
    if user.id == current_admin.id and user_in.role is not None and user_in.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin role",
        )

    return user_service.update_admin_fields(db, user, user_in)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_admin: User = Depends(deps.get_current_step_up_admin_user),
) -> Response:
    user = user_service.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    if user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete another admin",
        )

    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
