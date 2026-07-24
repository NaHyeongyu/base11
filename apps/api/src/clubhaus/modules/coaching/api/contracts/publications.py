from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PublicationResponse(BaseModel):
    session_id: UUID
    session_status: str
    version: int
    audiences: list[str]
    published_at: datetime
