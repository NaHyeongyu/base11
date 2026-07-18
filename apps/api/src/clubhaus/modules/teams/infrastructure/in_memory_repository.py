from uuid import UUID

from clubhaus.modules.teams.domain.team import Team


class InMemoryTeamRepository:
    """Development adapter. Replace with SQLAlchemy without changing the use case."""

    _organization_id = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
    _teams = (
        Team(
            id=UUID("11111111-1111-4111-8111-111111111111"),
            organization_id=_organization_id,
            name="FC 안양 U18",
            age_group="U18",
            season=2026,
        ),
    )

    def list_for_organization(self, organization_id: UUID) -> tuple[Team, ...]:
        return tuple(team for team in self._teams if team.organization_id == organization_id)
