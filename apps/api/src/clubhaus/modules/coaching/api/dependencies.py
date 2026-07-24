from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from clubhaus.core.database import get_db
from clubhaus.modules.coaching.infrastructure.models.planning import (
    MicrocycleModel,
    TrainingSessionModel,
)
from clubhaus.modules.coaching.infrastructure.records import find_microcycle, find_session

DbSession = Annotated[Session, Depends(get_db)]


def load_microcycle(db: Session, microcycle_id: UUID) -> MicrocycleModel:
    microcycle = find_microcycle(db, microcycle_id)
    if microcycle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Microcycle not found")
    return microcycle


def load_session(db: Session, session_id: UUID) -> TrainingSessionModel:
    training_session = find_session(db, session_id)
    if training_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return training_session
