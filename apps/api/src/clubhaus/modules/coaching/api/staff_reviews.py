from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import (
    COACHING_ROLES,
    HEAD_COACH_ROLES,
    require_team_membership,
)
from clubhaus.modules.coaching.api.contracts.staff_reviews import (
    StaffReviewCreate,
    StaffReviewDecision,
    StaffReviewResponse,
)
from clubhaus.modules.coaching.api.dependencies import DbSession, load_session
from clubhaus.modules.coaching.infrastructure.models.staff_reviews import StaffReviewModel
from clubhaus.modules.coaching.infrastructure.records import add_change_log

router = APIRouter(tags=["coaching"])


@router.get("/teams/{team_id}/staff-reviews", response_model=list[StaffReviewResponse])
def list_staff_reviews(
    team_id: UUID,
    db: DbSession,
    actor: CurrentActor,
    review_status: Annotated[str | None, Query(alias="status")] = None,
) -> list[StaffReviewModel]:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    statement = select(StaffReviewModel).where(StaffReviewModel.team_id == team_id)
    if review_status:
        statement = statement.where(StaffReviewModel.status == review_status)
    return list(db.scalars(statement.order_by(StaffReviewModel.created_at.desc())).all())


@router.post(
    "/teams/{team_id}/staff-reviews",
    response_model=StaffReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_staff_review(
    team_id: UUID, payload: StaffReviewCreate, db: DbSession, actor: CurrentActor
) -> StaffReviewModel:
    membership = require_team_membership(db, team_id, actor, COACHING_ROLES)
    training_session = load_session(db, payload.session_id)
    if training_session.team_id != team_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Session mismatch"
        )
    review = StaffReviewModel(
        team_id=team_id,
        session_id=payload.session_id,
        author_membership_id=membership.id,
        message=payload.message,
        proposed_changes=payload.proposed_changes,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.post("/staff-reviews/{review_id}/decision", response_model=StaffReviewResponse)
def decide_staff_review(
    review_id: UUID,
    payload: StaffReviewDecision,
    db: DbSession,
    actor: CurrentActor,
) -> StaffReviewModel:
    review = db.get(StaffReviewModel, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    require_team_membership(db, review.team_id, actor, HEAD_COACH_ROLES)
    if review.status != "open":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Review is already resolved"
        )
    review.status = "resolved"
    review.decision = payload.decision
    review.decision_note = payload.note
    review.decided_by_id = actor.user_id
    review.decided_at = datetime.now(UTC)
    add_change_log(
        db,
        team_id=review.team_id,
        actor_id=actor.user_id,
        entity_type="staff_review",
        entity_id=review.id,
        action="decided",
        changes={"decision": payload.decision, "note": payload.note},
    )
    db.commit()
    db.refresh(review)
    return review
