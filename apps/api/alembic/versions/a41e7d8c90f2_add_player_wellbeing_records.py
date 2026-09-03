"""add player wellbeing records

Revision ID: a41e7d8c90f2
Revises: 8ed77f9fe38d
Create Date: 2026-08-28 09:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a41e7d8c90f2"
down_revision: str | None = "8ed77f9fe38d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "player_readiness_entries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("team_id", sa.Uuid(), nullable=False),
        sa.Column("player_membership_id", sa.Uuid(), nullable=False),
        sa.Column("recorded_on", sa.Date(), nullable=False),
        sa.Column("condition_score", sa.Integer(), nullable=False),
        sa.Column("pain_score", sa.Integer(), nullable=False),
        sa.Column("pain_area", sa.String(length=120), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("source_kind", sa.String(length=24), nullable=False),
        sa.Column("source_ref", sa.String(length=120), nullable=True),
        sa.Column("recorded_by_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["player_membership_id"],
            ["team_memberships.id"],
            name=op.f("fk_player_readiness_entries_player_membership_id_team_memberships"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["recorded_by_id"],
            ["users.id"],
            name=op.f("fk_player_readiness_entries_recorded_by_id_users"),
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            name=op.f("fk_player_readiness_entries_team_id_teams"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_player_readiness_entries")),
    )
    op.create_index(
        "ix_readiness_team_player_recorded",
        "player_readiness_entries",
        ["team_id", "player_membership_id", "recorded_on"],
        unique=False,
    )
    op.create_table(
        "player_availability_decisions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("team_id", sa.Uuid(), nullable=False),
        sa.Column("player_membership_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("availability", sa.String(length=24), nullable=False),
        sa.Column("restriction", sa.Text(), nullable=False),
        sa.Column("review_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("effective_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effective_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("source_kind", sa.String(length=24), nullable=False),
        sa.Column("source_ref", sa.String(length=120), nullable=True),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column("supersedes_id", sa.Uuid(), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("is_current", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_player_availability_decisions_created_by_id_users"),
        ),
        sa.ForeignKeyConstraint(
            ["player_membership_id"],
            ["team_memberships.id"],
            name=op.f(
                "fk_player_availability_decisions_player_membership_id_team_memberships"
            ),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["supersedes_id"],
            ["player_availability_decisions.id"],
            name=op.f(
                "fk_player_availability_decisions_supersedes_id_player_availability_decisions"
            ),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            name=op.f("fk_player_availability_decisions_team_id_teams"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_player_availability_decisions")),
    )
    op.create_index(
        "ix_availability_team_player_current",
        "player_availability_decisions",
        ["team_id", "player_membership_id", "is_current"],
        unique=False,
    )
    op.create_table(
        "injury_cases",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("team_id", sa.Uuid(), nullable=False),
        sa.Column("player_membership_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("stage", sa.String(length=24), nullable=False),
        sa.Column("body_area", sa.String(length=120), nullable=False),
        sa.Column("occurred_on", sa.Date(), nullable=False),
        sa.Column("diagnosis_confirmed", sa.Boolean(), nullable=False),
        sa.Column("operational_summary", sa.Text(), nullable=False),
        sa.Column("internal_note", sa.Text(), nullable=True),
        sa.Column("owner_membership_id", sa.Uuid(), nullable=True),
        sa.Column("review_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name=op.f("fk_injury_cases_created_by_id_users"),
        ),
        sa.ForeignKeyConstraint(
            ["owner_membership_id"],
            ["team_memberships.id"],
            name=op.f("fk_injury_cases_owner_membership_id_team_memberships"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["player_membership_id"],
            ["team_memberships.id"],
            name=op.f("fk_injury_cases_player_membership_id_team_memberships"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            name=op.f("fk_injury_cases_team_id_teams"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_injury_cases")),
    )
    op.create_index(
        "ix_injury_cases_team_player_status",
        "injury_cases",
        ["team_id", "player_membership_id", "status"],
        unique=False,
    )
    op.create_table(
        "player_health_changes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("team_id", sa.Uuid(), nullable=False),
        sa.Column("player_membership_id", sa.Uuid(), nullable=False),
        sa.Column("actor_user_id", sa.Uuid(), nullable=False),
        sa.Column("entity_type", sa.String(length=32), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("action", sa.String(length=32), nullable=False),
        sa.Column("before_value", sa.JSON(), nullable=True),
        sa.Column("after_value", sa.JSON(), nullable=False),
        sa.Column("source", sa.String(length=80), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["actor_user_id"],
            ["users.id"],
            name=op.f("fk_player_health_changes_actor_user_id_users"),
        ),
        sa.ForeignKeyConstraint(
            ["player_membership_id"],
            ["team_memberships.id"],
            name=op.f("fk_player_health_changes_player_membership_id_team_memberships"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            name=op.f("fk_player_health_changes_team_id_teams"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_player_health_changes")),
    )
    op.create_index(
        "ix_health_changes_team_player_created",
        "player_health_changes",
        ["team_id", "player_membership_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_health_changes_team_player_created", table_name="player_health_changes")
    op.drop_table("player_health_changes")
    op.drop_index("ix_injury_cases_team_player_status", table_name="injury_cases")
    op.drop_table("injury_cases")
    op.drop_index(
        "ix_availability_team_player_current",
        table_name="player_availability_decisions",
    )
    op.drop_table("player_availability_decisions")
    op.drop_index(
        "ix_readiness_team_player_recorded",
        table_name="player_readiness_entries",
    )
    op.drop_table("player_readiness_entries")
