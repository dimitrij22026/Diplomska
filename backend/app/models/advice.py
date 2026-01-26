from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AdviceEntry(Base):
    __tablename__ = "advice_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(
        "users.id", ondelete="CASCADE"), index=True)
    conversation_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True, default=lambda: str(uuid.uuid4()))
    prompt: Mapped[str] = mapped_column(String(512), nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="advice_entries")


if TYPE_CHECKING:  # pragma: no cover
    from app.models.user import User
