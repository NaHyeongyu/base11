from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

import pytest

from clubhaus.modules.coaching.application.performance import (
    DuplicatePlayerRowsError,
    import_status,
    requested_player_ids,
)
from clubhaus.modules.coaching.application.publications import build_publication_payloads
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
    assert payloads["staff"]["internal_notes"] == "선수에게 숨겨야 하는 메모"
    assert payloads["staff"]["blocks"] == ["전환 게임"]


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
