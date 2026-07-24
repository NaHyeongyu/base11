from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from clubhaus.modules.coaching.api.contracts.base import OrmSchema


class PerformanceRowInput(BaseModel):
    player_membership_id: UUID
    metrics: dict[str, float | int | str | None]


class PerformanceImportCreate(BaseModel):
    session_id: UUID
    source_vendor: str = Field(min_length=1, max_length=80)
    original_filename: str = Field(min_length=1, max_length=255)
    object_key: str | None = Field(default=None, max_length=500)
    column_mapping: dict[str, str] = Field(default_factory=dict)
    rows: list[PerformanceRowInput] = Field(default_factory=list, max_length=1000)


class PerformanceImportResponse(OrmSchema):
    id: UUID
    team_id: UUID
    session_id: UUID
    source_vendor: str
    original_filename: str
    object_key: str | None
    column_mapping: dict[str, Any]
    row_count: int
    matched_count: int
    status: str
    created_at: datetime
