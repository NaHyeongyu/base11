from uuid import UUID

from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import COACHING_ROLES, require_team_membership
from clubhaus.modules.coaching.api.contracts.dashboard import DashboardCounts, DashboardResponse
from clubhaus.modules.coaching.api.contracts.planning import MicrocycleResponse
from clubhaus.modules.coaching.api.contracts.player_development import PlayerIssueResponse
from clubhaus.modules.coaching.api.contracts.staff_reviews import StaffReviewResponse
from clubhaus.modules.coaching.api.dependencies import DbSession
from clubhaus.modules.coaching.infrastructure.models.performance import PerformanceImportModel
from clubhaus.modules.coaching.infrastructure.models.planning import (
    MicrocycleModel,
    TrainingSessionModel,
)
from clubhaus.modules.coaching.infrastructure.models.player_development import PlayerIssueModel
from clubhaus.modules.coaching.infrastructure.models.staff_reviews import StaffReviewModel

router = APIRouter(tags=["coaching"])


@router.get("/teams/{team_id}/dashboard", response_model=DashboardResponse)
def get_dashboard(team_id: UUID, db: DbSession, actor: CurrentActor) -> DashboardResponse:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    microcycle = db.scalar(
        select(MicrocycleModel)
        .where(MicrocycleModel.team_id == team_id)
        .options(selectinload(MicrocycleModel.sessions).selectinload(TrainingSessionModel.blocks))
        .order_by(MicrocycleModel.week_start.desc())
        .limit(1)
    )
    open_issues = (
        db.scalar(
            select(func.count())
            .select_from(PlayerIssueModel)
            .where(PlayerIssueModel.team_id == team_id, PlayerIssueModel.status == "open")
        )
        or 0
    )
    open_reviews = (
        db.scalar(
            select(func.count())
            .select_from(StaffReviewModel)
            .where(StaffReviewModel.team_id == team_id, StaffReviewModel.status == "open")
        )
        or 0
    )
    session_ids = [item.id for item in microcycle.sessions] if microcycle else []
    sessions_with_data = 0
    if session_ids:
        sessions_with_data = (
            db.scalar(
                select(func.count(func.distinct(PerformanceImportModel.session_id))).where(
                    PerformanceImportModel.session_id.in_(session_ids),
                    PerformanceImportModel.status == "completed",
                )
            )
            or 0
        )
    issues = db.scalars(
        select(PlayerIssueModel)
        .where(PlayerIssueModel.team_id == team_id, PlayerIssueModel.status == "open")
        .order_by(PlayerIssueModel.created_at.desc())
        .limit(5)
    ).all()
    reviews = db.scalars(
        select(StaffReviewModel)
        .where(StaffReviewModel.team_id == team_id, StaffReviewModel.status == "open")
        .order_by(StaffReviewModel.created_at.desc())
        .limit(5)
    ).all()
    return DashboardResponse(
        team_id=team_id,
        microcycle=(
            MicrocycleResponse.model_validate(microcycle, from_attributes=True)
            if microcycle
            else None
        ),
        counts=DashboardCounts(
            open_issues=open_issues,
            open_reviews=open_reviews,
            sessions_total=len(session_ids),
            sessions_with_data=sessions_with_data,
        ),
        recent_issues=[PlayerIssueResponse.model_validate(item) for item in issues],
        recent_reviews=[StaffReviewResponse.model_validate(item) for item in reviews],
    )
