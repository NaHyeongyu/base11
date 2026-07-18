from functools import lru_cache
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from clubhaus.modules.teams.application.list_teams import ListTeams
from clubhaus.modules.teams.infrastructure.in_memory_repository import InMemoryTeamRepository


class TeamResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    age_group: str
    season: int


@lru_cache
def get_list_teams() -> ListTeams:
    return ListTeams(InMemoryTeamRepository())


router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamResponse])
def list_teams(
    organization_id: UUID,
    query: Annotated[ListTeams, Depends(get_list_teams)],
) -> list[TeamResponse]:
    return [
        TeamResponse.model_validate(team, from_attributes=True)
        for team in query.execute(organization_id)
    ]
