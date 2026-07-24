from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from clubhaus.core.database import get_db
from clubhaus.modules.teams.application.list_teams import ListTeams
from clubhaus.modules.teams.infrastructure.sqlalchemy_repository import SqlAlchemyTeamRepository


def get_list_teams(db: Annotated[Session, Depends(get_db)]) -> ListTeams:
    return ListTeams(SqlAlchemyTeamRepository(db))


ListTeamsQuery = Annotated[ListTeams, Depends(get_list_teams)]
