from datetime import datetime
from typing import Protocol


class PublicationBlock(Protocol):
    title: str


class PublicationSession(Protocol):
    title: str
    objective: str
    scheduled_at: datetime
    location: str
    intensity: str
    internal_notes: str | None
    blocks: list[PublicationBlock]


def build_publication_payloads(session: PublicationSession) -> dict[str, dict[str, object]]:
    scheduled_at = session.scheduled_at.isoformat()
    return {
        "player": {
            "title": session.title,
            "objective": session.objective,
            "scheduled_at": scheduled_at,
            "location": session.location,
        },
        "staff": {
            "title": session.title,
            "objective": session.objective,
            "scheduled_at": scheduled_at,
            "location": session.location,
            "intensity": session.intensity,
            "internal_notes": session.internal_notes,
            "blocks": [block.title for block in session.blocks],
        },
        "parent": {
            "scheduled_at": scheduled_at,
            "location": session.location,
            "title": session.title,
        },
    }
