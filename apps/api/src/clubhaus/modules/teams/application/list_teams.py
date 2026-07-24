from uuid import UUID

from clubhaus.modules.teams.domain.repository import TeamReader
from clubhaus.modules.teams.domain.team import Team


class ListTeams:
    def __init__(self, reader: TeamReader) -> None:
        self._reader = reader

    def execute(self, user_id: UUID) -> tuple[Team, ...]:
        return self._reader.list_for_user(user_id)
