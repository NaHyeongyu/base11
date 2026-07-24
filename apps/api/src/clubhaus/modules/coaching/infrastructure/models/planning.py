from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from clubhaus.core.database import Base
from clubhaus.core.models import TimestampMixin


class MatchModel(Base, TimestampMixin):
    __tablename__ = "matches"
    __table_args__ = (Index("ix_matches_team_kickoff", "team_id", "kickoff_at"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    opponent: Mapped[str] = mapped_column(String(120), nullable=False)
    competition: Mapped[str] = mapped_column(String(120), nullable=False)
    kickoff_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    venue: Mapped[str] = mapped_column(String(180), nullable=False)
    home_away: Mapped[str] = mapped_column(String(12), default="home", nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="scheduled", nullable=False)


class MicrocycleModel(Base, TimestampMixin):
    __tablename__ = "microcycles"
    __table_args__ = (
        UniqueConstraint("team_id", "match_id", name="uq_microcycle_team_match"),
        Index("ix_microcycles_team_week", "team_id", "week_start"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    match_id: Mapped[UUID] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"))
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="draft", nullable=False)
    created_by_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    match: Mapped[MatchModel] = relationship(lazy="joined")
    sessions: Mapped[list["TrainingSessionModel"]] = relationship(
        back_populates="microcycle",
        cascade="all, delete-orphan",
        order_by="TrainingSessionModel.scheduled_at",
    )


class TrainingSessionModel(Base, TimestampMixin):
    __tablename__ = "training_sessions"
    __table_args__ = (
        UniqueConstraint("microcycle_id", "day_code", name="uq_session_microcycle_day"),
        Index("ix_sessions_team_scheduled", "team_id", "scheduled_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    microcycle_id: Mapped[UUID] = mapped_column(
        ForeignKey("microcycles.id", ondelete="CASCADE"), nullable=False
    )
    day_code: Mapped[str] = mapped_column(String(12), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    objective: Mapped[str] = mapped_column(Text, nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    intensity: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str] = mapped_column(String(180), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="draft", nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    internal_notes: Mapped[str | None] = mapped_column(Text)

    __mapper_args__ = {"version_id_col": version}

    microcycle: Mapped[MicrocycleModel] = relationship(back_populates="sessions")
    blocks: Mapped[list["SessionBlockModel"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="SessionBlockModel.sort_order",
    )


class SessionBlockModel(Base, TimestampMixin):
    __tablename__ = "session_blocks"
    __table_args__ = (UniqueConstraint("session_id", "sort_order", name="uq_block_session_order"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="CASCADE"), nullable=False
    )
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    intensity: Mapped[str] = mapped_column(String(20), nullable=False)
    group_name: Mapped[str] = mapped_column(String(80), nullable=False)
    owner_membership_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="SET NULL")
    )
    coaching_points: Mapped[str | None] = mapped_column(Text)

    session: Mapped[TrainingSessionModel] = relationship(back_populates="blocks")
