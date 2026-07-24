from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import COACHING_ROLES, require_team_membership
from clubhaus.modules.coaching.api.contracts.performance import (
    PerformanceImportCreate,
    PerformanceImportResponse,
)
from clubhaus.modules.coaching.api.dependencies import DbSession, load_session
from clubhaus.modules.coaching.application.performance import (
    DuplicatePlayerRowsError,
    import_status,
    requested_player_ids,
)
from clubhaus.modules.coaching.infrastructure.models.performance import (
    PerformanceImportModel,
    PerformanceMetricModel,
)
from clubhaus.modules.coaching.infrastructure.records import add_change_log
from clubhaus.modules.teams.infrastructure.models import TeamMembershipModel

router = APIRouter(tags=["coaching"])


@router.get("/teams/{team_id}/performance-imports", response_model=list[PerformanceImportResponse])
def list_performance_imports(
    team_id: UUID, db: DbSession, actor: CurrentActor
) -> list[PerformanceImportModel]:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    return list(
        db.scalars(
            select(PerformanceImportModel)
            .where(PerformanceImportModel.team_id == team_id)
            .order_by(PerformanceImportModel.created_at.desc())
        ).all()
    )


@router.post(
    "/teams/{team_id}/performance-imports",
    response_model=PerformanceImportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_performance_import(
    team_id: UUID, payload: PerformanceImportCreate, db: DbSession, actor: CurrentActor
) -> PerformanceImportModel:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    training_session = load_session(db, payload.session_id)
    if training_session.team_id != team_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Session mismatch"
        )
    try:
        player_ids = requested_player_ids(payload.rows)
    except DuplicatePlayerRowsError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error
    valid_player_ids = (
        set(
            db.scalars(
                select(TeamMembershipModel.id).where(
                    TeamMembershipModel.team_id == team_id,
                    TeamMembershipModel.role == "player",
                    TeamMembershipModel.active.is_(True),
                    TeamMembershipModel.id.in_(player_ids),
                )
            ).all()
        )
        if player_ids
        else set()
    )
    performance_import = PerformanceImportModel(
        team_id=team_id,
        session_id=payload.session_id,
        source_vendor=payload.source_vendor,
        original_filename=payload.original_filename,
        object_key=payload.object_key,
        column_mapping=payload.column_mapping,
        row_count=len(payload.rows),
        matched_count=len(valid_player_ids),
        status=import_status(row_count=len(payload.rows), matched_count=len(valid_player_ids)),
        imported_by_id=actor.user_id,
    )
    performance_import.metrics = [
        PerformanceMetricModel(
            team_id=team_id,
            session_id=payload.session_id,
            player_membership_id=row.player_membership_id,
            metrics=row.metrics,
        )
        for row in payload.rows
        if row.player_membership_id in valid_player_ids
    ]
    db.add(performance_import)
    db.flush()
    add_change_log(
        db,
        team_id=team_id,
        actor_id=actor.user_id,
        entity_type="performance_import",
        entity_id=performance_import.id,
        action="created",
        changes={
            "source_vendor": payload.source_vendor,
            "rows": len(payload.rows),
            "matched": len(valid_player_ids),
        },
    )
    db.commit()
    db.refresh(performance_import)
    return performance_import
