from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from clubhaus.core.auth import Actor
from clubhaus.modules.teams.infrastructure.models import TeamMembershipModel

COACHING_ROLES = {"head_coach", "coach", "medical", "admin"}
HEAD_COACH_ROLES = {"head_coach", "admin"}


def require_team_membership(
    db: Session,
    team_id: UUID,
    actor: Actor,
    roles: set[str] | None = None,
) -> TeamMembershipModel:
    membership = db.scalar(
        select(TeamMembershipModel).where(
            TeamMembershipModel.team_id == team_id,
            TeamMembershipModel.user_id == actor.user_id,
            TeamMembershipModel.active.is_(True),
        )
    )
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if roles is not None and membership.role not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient team role")
    return membership


def require_player_membership(db: Session, team_id: UUID, membership_id: UUID) -> None:
    membership = db.scalar(
        select(TeamMembershipModel.id).where(
            TeamMembershipModel.id == membership_id,
            TeamMembershipModel.team_id == team_id,
            TeamMembershipModel.role == "player",
            TeamMembershipModel.active.is_(True),
        )
    )
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Player not found"
        )


def require_team_membership_ids(
    db: Session,
    team_id: UUID,
    membership_ids: set[UUID],
    roles: set[str] | None = None,
) -> None:
    if not membership_ids:
        return
    statement = select(TeamMembershipModel.id).where(
        TeamMembershipModel.id.in_(membership_ids),
        TeamMembershipModel.team_id == team_id,
        TeamMembershipModel.active.is_(True),
    )
    if roles is not None:
        statement = statement.where(TeamMembershipModel.role.in_(roles))
    valid_ids = set(db.scalars(statement).all())
    if valid_ids != membership_ids:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="A referenced team member is invalid",
        )
