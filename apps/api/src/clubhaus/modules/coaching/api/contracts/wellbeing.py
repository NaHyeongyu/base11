from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from clubhaus.modules.coaching.api.contracts.base import OrmSchema

HealthStatus = Literal["normal", "monitor", "limited", "rehab"]
Availability = Literal["full", "limited", "unavailable"]
InjuryStage = Literal[
    "none", "pain_observation", "treatment", "rehab", "return_review", "returned"
]
SourceKind = Literal["wellbeing", "player_detail", "training", "match", "medical"]


class WellbeingUpdateCreate(BaseModel):
    condition_score: int = Field(ge=0, le=10)
    pain_score: int = Field(ge=0, le=10)
    pain_area: str | None = Field(default=None, max_length=120)
    status: HealthStatus
    availability: Availability
    injury_stage: InjuryStage = "none"
    restriction: str = Field(min_length=1, max_length=500)
    review_at: datetime | None = None
    note: str | None = Field(default=None, max_length=2000)
    source_kind: SourceKind = "wellbeing"
    source_ref: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def validate_operational_state(self) -> "WellbeingUpdateCreate":
        restriction = self.restriction.strip()
        pain_area = self.pain_area.strip() if self.pain_area else None

        if self.status == "normal":
            if self.availability != "full":
                raise ValueError("Normal status requires full availability")
            if self.pain_score != 0 or self.injury_stage != "none":
                raise ValueError("Normal status cannot have pain or an active injury stage")
        else:
            if self.review_at is None:
                raise ValueError("A non-normal status requires a review time")
            if restriction in {"", "제한 없음"}:
                raise ValueError("A non-normal status requires a restriction summary")

        if self.status in {"limited", "rehab"} and self.availability == "full":
            raise ValueError("Limited or rehab status cannot have full availability")
        if self.status == "rehab" and self.injury_stage not in {"rehab", "return_review"}:
            raise ValueError("Rehab status requires a rehab or return-review stage")
        if self.pain_score > 0 and not pain_area:
            raise ValueError("Pain area is required when pain score is above zero")

        self.restriction = restriction
        self.pain_area = pain_area
        return self


class ReadinessResponse(OrmSchema):
    id: UUID
    recorded_on: date
    condition_score: int
    pain_score: int
    pain_area: str | None
    note: str | None
    source_kind: str
    source_ref: str | None
    created_at: datetime


class AvailabilityResponse(OrmSchema):
    id: UUID
    status: str
    availability: str
    restriction: str
    review_at: datetime | None
    effective_from: datetime
    source_kind: str
    source_ref: str | None
    version: int


class InjuryCaseResponse(OrmSchema):
    id: UUID
    status: str
    stage: str
    body_area: str
    occurred_on: date
    diagnosis_confirmed: bool
    operational_summary: str
    owner_membership_id: UUID | None
    review_at: datetime | None
    version: int
    closed_at: datetime | None


class PlayerWellbeingResponse(BaseModel):
    player_membership_id: UUID
    player_name: str
    squad_number: int | None
    position: str | None
    grade: str | None
    readiness: ReadinessResponse | None
    availability: AvailabilityResponse | None
    active_injury: InjuryCaseResponse | None


class WellbeingSummaryResponse(BaseModel):
    players_total: int
    attention: int
    limited: int
    unavailable: int
    checked_today: int
    average_condition: float | None


class WellbeingOverviewResponse(BaseModel):
    summary: WellbeingSummaryResponse
    players: list[PlayerWellbeingResponse]


class HealthChangeResponse(OrmSchema):
    id: UUID
    player_membership_id: UUID
    actor_user_id: UUID
    entity_type: str
    entity_id: UUID
    action: str
    before_value: dict | None
    after_value: dict
    source: str
    created_at: datetime


class WellbeingUpdateResponse(BaseModel):
    player: PlayerWellbeingResponse
    changes: list[HealthChangeResponse]
