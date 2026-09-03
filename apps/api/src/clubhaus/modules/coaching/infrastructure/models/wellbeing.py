from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from clubhaus.core.database import Base
from clubhaus.core.models import TimestampMixin


class PlayerReadinessModel(Base):
    """Immutable daily readiness observation."""

    __tablename__ = "player_readiness_entries"
    __table_args__ = (
        Index(
            "ix_readiness_team_player_recorded",
            "team_id",
            "player_membership_id",
            "recorded_on",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    recorded_on: Mapped[date] = mapped_column(Date, nullable=False)
    condition_score: Mapped[int] = mapped_column(Integer, nullable=False)
    pain_score: Mapped[int] = mapped_column(Integer, nullable=False)
    pain_area: Mapped[str | None] = mapped_column(String(120))
    note: Mapped[str | None] = mapped_column(Text)
    source_kind: Mapped[str] = mapped_column(String(24), nullable=False)
    source_ref: Mapped[str | None] = mapped_column(String(120))
    recorded_by_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PlayerAvailabilityDecisionModel(Base, TimestampMixin):
    """Versioned operational participation decision. Only one row is current per player."""

    __tablename__ = "player_availability_decisions"
    __table_args__ = (
        Index(
            "ix_availability_team_player_current",
            "team_id",
            "player_membership_id",
            "is_current",
        ),
        Index(
            "uq_availability_current_player",
            "team_id",
            "player_membership_id",
            unique=True,
            postgresql_where=text("is_current"),
            sqlite_where=text("is_current = 1"),
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    availability: Mapped[str] = mapped_column(String(24), nullable=False)
    restriction: Mapped[str] = mapped_column(Text, nullable=False)
    review_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_kind: Mapped[str] = mapped_column(String(24), nullable=False)
    source_ref: Mapped[str | None] = mapped_column(String(120))
    created_by_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    supersedes_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("player_availability_decisions.id", ondelete="SET NULL")
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class InjuryCaseModel(Base, TimestampMixin):
    """An injury or rehabilitation episode, separated from daily readiness."""

    __tablename__ = "injury_cases"
    __table_args__ = (
        Index("ix_injury_cases_team_player_status", "team_id", "player_membership_id", "status"),
        Index(
            "uq_injury_open_player",
            "team_id",
            "player_membership_id",
            unique=True,
            postgresql_where=text("status = 'open'"),
            sqlite_where=text("status = 'open'"),
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)
    stage: Mapped[str] = mapped_column(String(24), nullable=False)
    body_area: Mapped[str] = mapped_column(String(120), nullable=False)
    occurred_on: Mapped[date] = mapped_column(Date, nullable=False)
    diagnosis_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    operational_summary: Mapped[str] = mapped_column(Text, nullable=False)
    internal_note: Mapped[str | None] = mapped_column(Text)
    owner_membership_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="SET NULL")
    )
    review_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)


class PlayerHealthChangeModel(Base):
    """Append-only audit log used by the wellbeing change-history screen."""

    __tablename__ = "player_health_changes"
    __table_args__ = (
        Index(
            "ix_health_changes_team_player_created",
            "team_id",
            "player_membership_id",
            "created_at",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    actor_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(32), nullable=False)
    entity_id: Mapped[UUID] = mapped_column(Uuid, nullable=False)
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    before_value: Mapped[dict | None] = mapped_column(JSON)
    after_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    source: Mapped[str] = mapped_column(String(80), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
