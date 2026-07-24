from collections.abc import Iterable, Mapping
from typing import Protocol
from uuid import UUID


class OwnedBlock(Protocol):
    owner_membership_id: UUID | None


class StaleSessionVersionError(ValueError):
    def __init__(self, current_version: int) -> None:
        self.current_version = current_version
        super().__init__(f"Session is at version {current_version}")


def ensure_expected_version(*, current_version: int, expected_version: int) -> None:
    if current_version != expected_version:
        raise StaleSessionVersionError(current_version)


def editable_session_changes(values: Mapping[str, object]) -> dict[str, object]:
    return {
        key: value for key, value in values.items() if key not in {"blocks", "expected_version"}
    }


def block_owner_ids(blocks: Iterable[OwnedBlock]) -> set[UUID]:
    return {block.owner_membership_id for block in blocks if block.owner_membership_id is not None}
