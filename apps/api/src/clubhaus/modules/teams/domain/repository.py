from typing import Protocol
from uuid import UUID

from clubhaus.modules.teams.domain.team import Team


class TeamReader(Protocol):
    def list_for_user(self, user_id: UUID) -> tuple[Team, ...]: ...
