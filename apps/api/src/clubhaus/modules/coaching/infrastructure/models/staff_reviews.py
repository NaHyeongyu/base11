from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from clubhaus.core.database import Base
from clubhaus.core.models import TimestampMixin


class StaffReviewModel(Base, TimestampMixin):
    __tablename__ = "staff_reviews"
    __table_args__ = (Index("ix_reviews_session_status", "session_id", "status"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="CASCADE"), nullable=False
    )
    author_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    proposed_changes: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="open", nullable=False)
    decision: Mapped[str | None] = mapped_column(String(24))
    decision_note: Mapped[str | None] = mapped_column(Text)
    decided_by_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
