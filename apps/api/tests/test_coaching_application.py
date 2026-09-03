from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

import pytest

from clubhaus.modules.coaching.application.performance import (
    DuplicatePlayerRowsError,
    import_status,
    requested_player_ids,
)
from clubhaus.modules.coaching.application.publications import (
    build_parent_player_payload,
    build_publication_payloads,
)
from clubhaus.modules.coaching.application.sessions import (
    StaleSessionVersionError,
    block_owner_ids,
    editable_session_changes,
    ensure_expected_version,
)


@dataclass
class Block:
    title: str


@dataclass
class Session:
    title: str
    objective: str
    scheduled_at: datetime
    location: str
    intensity: str
    internal_notes: str | None
    blocks: list[Block]


@dataclass
class Row:
    player_membership_id: UUID


@dataclass
class OwnedBlockInput:
    owner_membership_id: UUID | None


def test_publication_payloads_keep_internal_notes_staff_only() -> None:
    payloads = build_publication_payloads(
        Session(
            title="포지션 훈련",
            objective="역할 정교화",
            scheduled_at=datetime(2026, 7, 18, 8, 0, tzinfo=UTC),
            location="안양 보조구장",
            intensity="medium",
            internal_notes="선수에게 숨겨야 하는 메모",
            blocks=[Block(title="전환 게임")],
        )
    )

    assert list(payloads) == ["player", "staff", "parent"]
    assert "internal_notes" not in payloads["player"]
    assert "internal_notes" not in payloads["parent"]
    assert payloads["parent"]["access_scope"] == "linked_child_only"
    assert payloads["parent"]["visible_sections"] == [
        "child_training",
        "child_match",
        "published_feedback",
    ]
    assert payloads["staff"]["internal_notes"] == "선수에게 숨겨야 하는 메모"
    assert payloads["staff"]["blocks"] == ["전환 게임"]


def test_parent_player_payload_is_child_scoped_and_allowlisted() -> None:
    player_id = UUID("88888888-8888-4888-8888-888888888888")
    payload = build_parent_player_payload(
        player_membership_id=player_id,
        session_type="match",
        metrics={
            "minutes": 72,
            "rating": 8.1,
            "total_distance_m": 8450,
            "internal_notes": "학부모에게 보이면 안 되는 메모",
            "team_tactics": "4-3-3 압박 트리거",
            "other_players": ["선수 A", "선수 B"],
        },
        feedback="전환 뒤 첫 움직임이 좋았습니다.",
        feedback_visible=True,
    )

    assert payload == {
        "access_scope": "linked_child_only",
        "player_membership_id": str(player_id),
        "session_type": "match",
        "metrics": {"minutes": 72, "rating": 8.1, "total_distance_m": 8450},
        "feedback": "전환 뒤 첫 움직임이 좋았습니다.",
    }
    assert "internal_notes" not in payload["metrics"]
    assert "team_tactics" not in payload["metrics"]
    assert "other_players" not in payload["metrics"]


def test_parent_player_payload_hides_unpublished_feedback() -> None:
    payload = build_parent_player_payload(
        player_membership_id=UUID("77777777-7777-4777-8777-777777777777"),
        session_type="training",
        metrics={"condition": 8, "rpe": 6},
        feedback="지도자 검토 중",
        feedback_visible=False,
    )

    assert payload["feedback"] is None


def test_performance_import_rules_detect_duplicates_and_status() -> None:
    player_id = UUID("99999999-9999-4999-8999-999999999999")

    with pytest.raises(DuplicatePlayerRowsError):
        requested_player_ids([Row(player_id), Row(player_id)])

    assert requested_player_ids([Row(player_id)]) == {player_id}
    assert import_status(row_count=1, matched_count=1) == "completed"
    assert import_status(row_count=2, matched_count=1) == "needs_review"


def test_session_rules_keep_transport_fields_out_of_changes() -> None:
    owner_id = UUID("33333333-3333-4333-8333-333333333333")

    assert editable_session_changes(
        {"objective": "새 목적", "expected_version": 2, "blocks": []}
    ) == {"objective": "새 목적"}
    assert block_owner_ids([OwnedBlockInput(owner_id), OwnedBlockInput(None)]) == {owner_id}
    ensure_expected_version(current_version=2, expected_version=2)
    with pytest.raises(StaleSessionVersionError) as error:
        ensure_expected_version(current_version=3, expected_version=2)
    assert error.value.current_version == 3
