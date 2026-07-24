from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import JSON, ForeignKey, Index, Integer, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from clubhaus.core.database import Base
from clubhaus.core.models import TimestampMixin


class PerformanceImportModel(Base, TimestampMixin):
    __tablename__ = "performance_imports"
    __table_args__ = (Index("ix_imports_team_session", "team_id", "session_id"),)

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="CASCADE"), nullable=False
    )
    source_vendor: Mapped[str] = mapped_column(String(80), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    object_key: Mapped[str | None] = mapped_column(String(500))
    column_mapping: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    row_count: Mapped[int] = mapped_column(Integer, nullable=False)
    matched_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="validating", nullable=False)
    imported_by_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)

    metrics: Mapped[list["PerformanceMetricModel"]] = relationship(
        back_populates="performance_import", cascade="all, delete-orphan"
    )


class PerformanceMetricModel(Base, TimestampMixin):
    __tablename__ = "performance_metrics"
    __table_args__ = (
        UniqueConstraint("import_id", "player_membership_id", name="uq_metric_import_player"),
        Index("ix_metrics_session_player", "session_id", "player_membership_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    import_id: Mapped[UUID] = mapped_column(
        ForeignKey("performance_imports.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="CASCADE"), nullable=False
    )
    player_membership_id: Mapped[UUID] = mapped_column(
        ForeignKey("team_memberships.id", ondelete="CASCADE"), nullable=False
    )
    metrics: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    performance_import: Mapped[PerformanceImportModel] = relationship(back_populates="metrics")
