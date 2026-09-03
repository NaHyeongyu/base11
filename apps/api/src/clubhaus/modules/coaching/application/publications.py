from datetime import datetime
from typing import Protocol
from uuid import UUID

PARENT_PLAYER_METRIC_ALLOWLIST = {
    "participation",
    "condition",
    "rpe",
    "role",
    "minutes",
    "rating",
    "total_distance_m",
    "high_speed_distance_m",
    "sprints",
    "max_speed_kmh",
}


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
            "access_scope": "linked_child_only",
            "visible_sections": ["child_training", "child_match", "published_feedback"],
        },
    }


def build_parent_player_payload(
    *,
    player_membership_id: UUID,
    session_type: str,
    metrics: dict[str, object],
    feedback: str | None,
    feedback_visible: bool,
) -> dict[str, object]:
    """Build the only payload shape a guardian-facing endpoint may return.

    The caller must verify that the authenticated guardian is linked to
    ``player_membership_id`` before using this projection.
    """
    allowed_metrics = {
        key: value for key, value in metrics.items() if key in PARENT_PLAYER_METRIC_ALLOWLIST
    }
    return {
        "access_scope": "linked_child_only",
        "player_membership_id": str(player_membership_id),
        "session_type": session_type,
        "metrics": allowed_metrics,
        "feedback": feedback if feedback_visible and feedback else None,
    }
