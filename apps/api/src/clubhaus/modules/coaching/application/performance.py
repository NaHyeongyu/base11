from collections.abc import Iterable
from typing import Protocol
from uuid import UUID


class PerformanceRow(Protocol):
    player_membership_id: UUID


class DuplicatePlayerRowsError(ValueError):
    pass


def requested_player_ids(rows: Iterable[PerformanceRow]) -> set[UUID]:
    row_list = list(rows)
    player_ids = {row.player_membership_id for row in row_list}
    if len(player_ids) != len(row_list):
        raise DuplicatePlayerRowsError("Each player may appear only once per import")
    return player_ids


def import_status(*, row_count: int, matched_count: int) -> str:
    return "completed" if matched_count == row_count else "needs_review"
