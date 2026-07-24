from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from clubhaus.modules.coaching.api.contracts.base import OrmSchema


class StaffReviewCreate(BaseModel):
    session_id: UUID
    message: str = Field(min_length=1)
    proposed_changes: dict[str, Any] = Field(default_factory=dict)


class StaffReviewDecision(BaseModel):
    decision: str = Field(pattern="^(accepted|kept|rejected)$")
    note: str = Field(min_length=1)


class StaffReviewResponse(OrmSchema):
    id: UUID
    team_id: UUID
    session_id: UUID
    author_membership_id: UUID
    message: str
    proposed_changes: dict[str, Any]
    status: str
    decision: str | None
    decision_note: str | None
    decided_by_id: UUID | None
    decided_at: datetime | None
    created_at: datetime
