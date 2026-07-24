from uuid import UUID

from pydantic import BaseModel

from clubhaus.modules.coaching.api.contracts.planning import MicrocycleResponse
from clubhaus.modules.coaching.api.contracts.player_development import PlayerIssueResponse
from clubhaus.modules.coaching.api.contracts.staff_reviews import StaffReviewResponse


class DashboardCounts(BaseModel):
    open_issues: int
    open_reviews: int
    sessions_total: int
    sessions_with_data: int


class DashboardResponse(BaseModel):
    team_id: UUID
    microcycle: MicrocycleResponse | None
    counts: DashboardCounts
    recent_issues: list[PlayerIssueResponse]
    recent_reviews: list[StaffReviewResponse]
