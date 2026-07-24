from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from clubhaus.core.database import Base
from clubhaus.core.models import TimestampMixin


class PlayerGoalModel(Base, TimestampMixin):
    __tablename__ = "player_goals"
    __table_args__ = (
        Index("ix_goals_team_player_status", "team_id", "player_membership_id", "status"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    baseline: Mapped[str] = mapped_column(String(180), nullable=False)
    target: Mapped[str] = mapped_column(String(180), nullable=False)
    metric_key: Mapped[str] = mapped_column(String(80), nullable=False)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    review_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="active", nullable=False)
    visibility: Mapped[str] = mapped_column(String(24), default="private", nullable=False)
    created_by_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)


class PlayerIssueModel(Base, TimestampMixin):
    __tablename__ = "player_issues"
    __table_args__ = (Index("ix_issues_team_status", "team_id", "status"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="SET NULL")
    )
    issue_type: Mapped[str] = mapped_column(String(32), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False)
    restriction: Mapped[str | None] = mapped_column(Text)
    owner_membership_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="SET NULL")
    )
    status: Mapped[str] = mapped_column(String(24), default="open", nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
