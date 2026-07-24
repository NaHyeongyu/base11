from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from clubhaus.modules.coaching.infrastructure.models.audit import ChangeLogModel
from clubhaus.modules.coaching.infrastructure.models.planning import (
    MicrocycleModel,
    TrainingSessionModel,
)


def add_change_log(
    db: Session,
    *,
    team_id: UUID,
    actor_id: UUID,
    entity_type: str,
    entity_id: UUID,
    action: str,
    changes: dict[str, Any],
) -> None:
    db.add(
        ChangeLogModel(
            team_id=team_id,
            actor_user_id=actor_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            changes=changes,
        )
    )


def find_microcycle(db: Session, microcycle_id: UUID) -> MicrocycleModel | None:
    return db.scalar(
        select(MicrocycleModel)
        .where(MicrocycleModel.id == microcycle_id)
        .options(selectinload(MicrocycleModel.sessions).selectinload(TrainingSessionModel.blocks))
    )


def find_session(db: Session, session_id: UUID) -> TrainingSessionModel | None:
    return db.scalar(
        select(TrainingSessionModel)
        .where(TrainingSessionModel.id == session_id)
        .options(selectinload(TrainingSessionModel.blocks))
    )
