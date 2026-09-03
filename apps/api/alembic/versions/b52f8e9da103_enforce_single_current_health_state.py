"""enforce single current health state

Revision ID: b52f8e9da103
Revises: a41e7d8c90f2
Create Date: 2026-08-28 12:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b52f8e9da103"
down_revision: str | None = "a41e7d8c90f2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "uq_availability_current_player",
        "player_availability_decisions",
        ["team_id", "player_membership_id"],
        unique=True,
        postgresql_where=sa.text("is_current"),
    )
    op.create_index(
        "uq_injury_open_player",
        "injury_cases",
        ["team_id", "player_membership_id"],
        unique=True,
        postgresql_where=sa.text("status = 'open'"),
    )


def downgrade() -> None:
    op.drop_index("uq_injury_open_player", table_name="injury_cases")
    op.drop_index(
        "uq_availability_current_player",
        table_name="player_availability_decisions",
    )
