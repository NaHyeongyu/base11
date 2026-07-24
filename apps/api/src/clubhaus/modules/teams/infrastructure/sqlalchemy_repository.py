from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from clubhaus.modules.teams.domain.team import Team
from clubhaus.modules.teams.infrastructure.models import TeamMembershipModel, TeamModel


class SqlAlchemyTeamRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_for_user(self, user_id: UUID) -> tuple[Team, ...]:
        rows = self._db.scalars(
            select(TeamModel)
            .join(TeamMembershipModel, TeamMembershipModel.team_id == TeamModel.id)
            .where(
                TeamMembershipModel.user_id == user_id,
                TeamMembershipModel.active.is_(True),
            )
            .order_by(TeamModel.season.desc(), TeamModel.name)
        ).all()
        return tuple(
            Team(
                id=row.id,
                organization_id=row.organization_id,
                name=row.name,
                age_group=row.age_group,
                season=row.season,
                timezone=row.timezone,
                status=row.status,
            )
            for row in rows
        )
