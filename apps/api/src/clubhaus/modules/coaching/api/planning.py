from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.exc import StaleDataError

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import (
    COACHING_ROLES,
    HEAD_COACH_ROLES,
    require_team_membership,
    require_team_membership_ids,
)
from clubhaus.modules.coaching.api.contracts.planning import (
    MicrocycleCreate,
    MicrocycleResponse,
    SessionResponse,
    SessionUpdate,
)
from clubhaus.modules.coaching.api.dependencies import DbSession, load_microcycle, load_session
from clubhaus.modules.coaching.application.sessions import (
    StaleSessionVersionError,
    block_owner_ids,
    editable_session_changes,
    ensure_expected_version,
)
from clubhaus.modules.coaching.infrastructure.models.planning import (
    MatchModel,
    MicrocycleModel,
    SessionBlockModel,
    TrainingSessionModel,
)
from clubhaus.modules.coaching.infrastructure.records import add_change_log

router = APIRouter(tags=["coaching"])


@router.get("/teams/{team_id}/microcycles", response_model=list[MicrocycleResponse])
def list_microcycles(
    team_id: UUID,
    db: DbSession,
    actor: CurrentActor,
    limit: Annotated[int, Query(ge=1, le=52)] = 12,
) -> list[MicrocycleModel]:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    return list(
        db.scalars(
            select(MicrocycleModel)
            .where(MicrocycleModel.team_id == team_id)
            .options(
                selectinload(MicrocycleModel.sessions).selectinload(TrainingSessionModel.blocks)
            )
            .order_by(MicrocycleModel.week_start.desc())
            .limit(limit)
        ).all()
    )


@router.post(
    "/teams/{team_id}/microcycles",
    response_model=MicrocycleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_microcycle(
    team_id: UUID, payload: MicrocycleCreate, db: DbSession, actor: CurrentActor
) -> MicrocycleModel:
    require_team_membership(db, team_id, actor, HEAD_COACH_ROLES)
    owner_ids = block_owner_ids(block for session in payload.sessions for block in session.blocks)
    require_team_membership_ids(db, team_id, owner_ids, COACHING_ROLES)
    match = MatchModel(
        team_id=team_id,
        opponent=payload.opponent,
        competition=payload.competition,
        kickoff_at=payload.kickoff_at,
        venue=payload.venue,
        home_away=payload.home_away,
    )
    microcycle = MicrocycleModel(
        team_id=team_id,
        match=match,
        week_start=payload.week_start,
        title=payload.title,
        created_by_id=actor.user_id,
    )
    for item in payload.sessions:
        training_session = TrainingSessionModel(
            team_id=team_id,
            day_code=item.day_code,
            title=item.title,
            objective=item.objective,
            scheduled_at=item.scheduled_at,
            duration_minutes=item.duration_minutes,
            intensity=item.intensity,
            location=item.location,
            internal_notes=item.internal_notes,
        )
        training_session.blocks = [SessionBlockModel(**block.model_dump()) for block in item.blocks]
        microcycle.sessions.append(training_session)
    db.add(microcycle)
    db.flush()
    add_change_log(
        db,
        team_id=team_id,
        actor_id=actor.user_id,
        entity_type="microcycle",
        entity_id=microcycle.id,
        action="created",
        changes={"title": payload.title, "session_count": len(payload.sessions)},
    )
    db.commit()
    return load_microcycle(db, microcycle.id)


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: UUID, payload: SessionUpdate, db: DbSession, actor: CurrentActor
) -> TrainingSessionModel:
    training_session = load_session(db, session_id)
    require_team_membership(db, training_session.team_id, actor, COACHING_ROLES)
    try:
        ensure_expected_version(
            current_version=training_session.version,
            expected_version=payload.expected_version,
        )
    except StaleSessionVersionError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "Session was changed", "current_version": error.current_version},
        ) from error
    changes = editable_session_changes(payload.model_dump(exclude_unset=True))
    for key, value in changes.items():
        setattr(training_session, key, value)
    if payload.blocks is not None:
        owner_ids = block_owner_ids(payload.blocks)
        require_team_membership_ids(db, training_session.team_id, owner_ids, COACHING_ROLES)
        training_session.blocks.clear()
        training_session.blocks.extend(
            SessionBlockModel(**block.model_dump()) for block in payload.blocks
        )
        changes["blocks"] = len(payload.blocks)
    training_session.status = "draft"
    add_change_log(
        db,
        team_id=training_session.team_id,
        actor_id=actor.user_id,
        entity_type="session",
        entity_id=training_session.id,
        action="updated",
        changes=changes,
    )
    try:
        db.commit()
    except StaleDataError as error:
        db.rollback()
        current_version = db.scalar(
            select(TrainingSessionModel.version).where(TrainingSessionModel.id == session_id)
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "Session was changed", "current_version": current_version},
        ) from error
    return load_session(db, training_session.id)
