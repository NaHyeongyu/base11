from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field

from clubhaus.modules.coaching.api.contracts.base import OrmSchema


class MatchResponse(OrmSchema):
    id: UUID
    opponent: str
    competition: str
    kickoff_at: datetime
    venue: str
    home_away: str
    status: str


class SessionBlockInput(BaseModel):
    sort_order: int = Field(ge=0)
    title: str = Field(min_length=1, max_length=160)
    duration_minutes: int = Field(gt=0, le=240)
    intensity: str = Field(min_length=2, max_length=20)
    group_name: str = Field(min_length=1, max_length=80)
    owner_membership_id: UUID | None = None
    coaching_points: str | None = None


class SessionBlockResponse(OrmSchema):
    id: UUID
    sort_order: int
    title: str
    duration_minutes: int
    intensity: str
    group_name: str
    owner_membership_id: UUID | None
    coaching_points: str | None


class SessionInput(BaseModel):
    day_code: str = Field(min_length=2, max_length=12)
    title: str = Field(min_length=1, max_length=160)
    objective: str = Field(min_length=1)
    scheduled_at: datetime
    duration_minutes: int = Field(ge=0, le=480)
    intensity: str = Field(min_length=2, max_length=20)
    location: str = Field(min_length=1, max_length=180)
    internal_notes: str | None = None
    blocks: list[SessionBlockInput] = Field(default_factory=list)


class SessionResponse(OrmSchema):
    id: UUID
    day_code: str
    title: str
    objective: str
    scheduled_at: datetime
    duration_minutes: int
    intensity: str
    location: str
    status: str
    version: int
    internal_notes: str | None
    blocks: list[SessionBlockResponse]


class MicrocycleCreate(BaseModel):
    opponent: str = Field(min_length=1, max_length=120)
    competition: str = Field(min_length=1, max_length=120)
    kickoff_at: datetime
    venue: str = Field(min_length=1, max_length=180)
    home_away: str = Field(default="home", pattern="^(home|away|neutral)$")
    week_start: date
    title: str = Field(min_length=1, max_length=180)
    sessions: list[SessionInput] = Field(min_length=1, max_length=10)


class MicrocycleResponse(OrmSchema):
    id: UUID
    team_id: UUID
    week_start: date
    title: str
    status: str
    published_at: datetime | None
    match: MatchResponse
    sessions: list[SessionResponse]


class SessionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    objective: str | None = Field(default=None, min_length=1)
    scheduled_at: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=0, le=480)
    intensity: str | None = Field(default=None, min_length=2, max_length=20)
    location: str | None = Field(default=None, min_length=1, max_length=180)
    internal_notes: str | None = None
    blocks: list[SessionBlockInput] | None = None
    expected_version: int = Field(ge=1)
