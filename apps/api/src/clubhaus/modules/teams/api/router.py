from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.teams.api.dependencies import ListTeamsQuery
from clubhaus.modules.teams.domain.team import Team


class TeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    name: str
    age_group: str
    season: int
    timezone: str
    status: str


router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamResponse])
def list_teams(
    actor: CurrentActor,
    query: ListTeamsQuery,
) -> tuple[Team, ...]:
    return query.execute(actor.user_id)
