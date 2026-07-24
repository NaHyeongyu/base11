from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import (
    COACHING_ROLES,
    require_player_membership,
    require_team_membership,
)
from clubhaus.modules.coaching.api.contracts.player_development import (
    PlayerGoalCreate,
    PlayerGoalResponse,
    PlayerIssueCreate,
    PlayerIssueResponse,
)
from clubhaus.modules.coaching.api.dependencies import DbSession, load_session
from clubhaus.modules.coaching.infrastructure.models.player_development import (
    PlayerGoalModel,
    PlayerIssueModel,
)

router = APIRouter(tags=["coaching"])


@router.get("/teams/{team_id}/goals", response_model=list[PlayerGoalResponse])
def list_player_goals(team_id: UUID, db: DbSession, actor: CurrentActor) -> list[PlayerGoalModel]:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    return list(
        db.scalars(
            select(PlayerGoalModel)
            .where(PlayerGoalModel.team_id == team_id)
            .order_by(PlayerGoalModel.review_date)
        ).all()
    )


@router.post(
    "/teams/{team_id}/goals",
    response_model=PlayerGoalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_player_goal(
    team_id: UUID, payload: PlayerGoalCreate, db: DbSession, actor: CurrentActor
) -> PlayerGoalModel:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    require_player_membership(db, team_id, payload.player_membership_id)
    goal = PlayerGoalModel(
        team_id=team_id,
        created_by_id=actor.user_id,
        **payload.model_dump(),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/teams/{team_id}/issues", response_model=list[PlayerIssueResponse])
def list_player_issues(
    team_id: UUID,
    db: DbSession,
    actor: CurrentActor,
    issue_status: Annotated[str | None, Query(alias="status")] = "open",
) -> list[PlayerIssueModel]:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    statement = select(PlayerIssueModel).where(PlayerIssueModel.team_id == team_id)
    if issue_status:
        statement = statement.where(PlayerIssueModel.status == issue_status)
    return list(db.scalars(statement.order_by(PlayerIssueModel.created_at.desc())).all())


@router.post(
    "/teams/{team_id}/issues",
    response_model=PlayerIssueResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_player_issue(
    team_id: UUID, payload: PlayerIssueCreate, db: DbSession, actor: CurrentActor
) -> PlayerIssueModel:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    require_player_membership(db, team_id, payload.player_membership_id)
    if payload.session_id:
        training_session = load_session(db, payload.session_id)
        if training_session.team_id != team_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Session mismatch"
            )
    issue = PlayerIssueModel(team_id=team_id, **payload.model_dump())
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue
