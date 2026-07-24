from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field

from clubhaus.modules.coaching.api.contracts.base import OrmSchema


class PlayerGoalCreate(BaseModel):
    player_membership_id: UUID
    title: str = Field(min_length=1, max_length=180)
    baseline: str = Field(min_length=1, max_length=180)
    target: str = Field(min_length=1, max_length=180)
    metric_key: str = Field(min_length=1, max_length=80)
    review_date: date
    visibility: str = Field(default="private", pattern="^(private|player|staff)$")


class PlayerGoalResponse(OrmSchema):
    id: UUID
    team_id: UUID
    player_membership_id: UUID
    title: str
    baseline: str
    target: str
    metric_key: str
    progress_percent: int
    review_date: date
    status: str
    visibility: str
    created_at: datetime


class PlayerIssueCreate(BaseModel):
    player_membership_id: UUID
    session_id: UUID | None = None
    issue_type: str = Field(min_length=1, max_length=32)
    severity: str = Field(pattern="^(low|medium|high)$")
    detail: str = Field(min_length=1)
    restriction: str | None = None
    owner_membership_id: UUID | None = None


class PlayerIssueResponse(OrmSchema):
    id: UUID
    team_id: UUID
    player_membership_id: UUID
    session_id: UUID | None
    issue_type: str
    severity: str
    detail: str
    restriction: str | None
    owner_membership_id: UUID | None
    status: str
    resolved_at: datetime | None
    created_at: datetime
