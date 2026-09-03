from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import (
    COACHING_ROLES,
    require_player_membership,
    require_team_membership,
)
from clubhaus.modules.coaching.api.contracts.wellbeing import (
    HealthChangeResponse,
    PlayerWellbeingResponse,
    WellbeingOverviewResponse,
    WellbeingSummaryResponse,
    WellbeingUpdateCreate,
    WellbeingUpdateResponse,
)
from clubhaus.modules.coaching.api.dependencies import DbSession
from clubhaus.modules.coaching.infrastructure.models.wellbeing import (
    InjuryCaseModel,
    PlayerAvailabilityDecisionModel,
    PlayerHealthChangeModel,
    PlayerReadinessModel,
)
from clubhaus.modules.teams.infrastructure.models import TeamMembershipModel, TeamModel

router = APIRouter(tags=["wellbeing"])


def _readiness_value(record: PlayerReadinessModel | None) -> dict | None:
    if record is None:
        return None
    return {
        "condition_score": record.condition_score,
        "pain_score": record.pain_score,
        "pain_area": record.pain_area,
        "note": record.note,
        "source_kind": record.source_kind,
        "source_ref": record.source_ref,
        "recorded_on": record.recorded_on.isoformat(),
    }


def _availability_value(record: PlayerAvailabilityDecisionModel | None) -> dict | None:
    if record is None:
        return None
    return {
        "status": record.status,
        "availability": record.availability,
        "restriction": record.restriction,
        "review_at": record.review_at.isoformat() if record.review_at else None,
        "version": record.version,
        "source_kind": record.source_kind,
        "source_ref": record.source_ref,
    }


def _injury_value(record: InjuryCaseModel | None) -> dict | None:
    if record is None:
        return None
    return {
        "status": record.status,
        "stage": record.stage,
        "body_area": record.body_area,
        "operational_summary": record.operational_summary,
        "review_at": record.review_at.isoformat() if record.review_at else None,
        "version": record.version,
    }


def _latest_by_player(records: list) -> dict[UUID, object]:
    result: dict[UUID, object] = {}
    for record in records:
        player_id = record.player_membership_id
        if player_id not in result:
            result[player_id] = record
    return result


def _load_player_rows(db: Session, team_id: UUID) -> list[TeamMembershipModel]:
    return list(
        db.scalars(
            select(TeamMembershipModel)
            .where(
                TeamMembershipModel.team_id == team_id,
                TeamMembershipModel.role == "player",
                TeamMembershipModel.active.is_(True),
            )
            .order_by(TeamMembershipModel.squad_number, TeamMembershipModel.created_at)
        )
        .unique()
        .all()
    )


def _build_player_response(
    membership: TeamMembershipModel,
    readiness: PlayerReadinessModel | None,
    availability: PlayerAvailabilityDecisionModel | None,
    injury: InjuryCaseModel | None,
) -> PlayerWellbeingResponse:
    return PlayerWellbeingResponse(
        player_membership_id=membership.id,
        player_name=membership.user.display_name,
        squad_number=membership.squad_number,
        position=membership.position,
        grade=membership.grade,
        readiness=readiness,
        availability=availability,
        active_injury=injury,
    )


def _load_overview_rows(
    db: Session, team_id: UUID
) -> tuple[
    list[TeamMembershipModel],
    dict[UUID, PlayerReadinessModel],
    dict[UUID, PlayerAvailabilityDecisionModel],
    dict[UUID, InjuryCaseModel],
]:
    memberships = _load_player_rows(db, team_id)
    readiness = _latest_by_player(
        list(
            db.scalars(
                select(PlayerReadinessModel)
                .where(PlayerReadinessModel.team_id == team_id)
                .order_by(PlayerReadinessModel.created_at.desc())
            ).all()
        ),
    )
    availability = {
        row.player_membership_id: row
        for row in db.scalars(
            select(PlayerAvailabilityDecisionModel).where(
                PlayerAvailabilityDecisionModel.team_id == team_id,
                PlayerAvailabilityDecisionModel.is_current.is_(True),
            )
        ).all()
    }
    injuries = {
        row.player_membership_id: row
        for row in db.scalars(
            select(InjuryCaseModel)
            .where(InjuryCaseModel.team_id == team_id, InjuryCaseModel.status == "open")
            .order_by(InjuryCaseModel.created_at.desc())
        ).all()
    }
    return memberships, readiness, availability, injuries


@router.get(
    "/teams/{team_id}/wellbeing",
    response_model=WellbeingOverviewResponse,
)
def get_wellbeing_overview(
    team_id: UUID, db: DbSession, actor: CurrentActor
) -> WellbeingOverviewResponse:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    memberships, readiness, availability, injuries = _load_overview_rows(db, team_id)
    team = db.get(TeamModel, team_id)
    assert team is not None
    today = datetime.now(ZoneInfo(team.timezone)).date()
    checked_today = [row for row in readiness.values() if row.recorded_on == today]
    attention = sum(
        1
        for membership in memberships
        if membership.id not in readiness
        or readiness[membership.id].recorded_on != today
        or availability.get(membership.id) is None
        or availability[membership.id].status != "normal"
        or readiness[membership.id].condition_score <= 5
    )
    limited = sum(1 for row in availability.values() if row.availability == "limited")
    unavailable = sum(1 for row in availability.values() if row.availability == "unavailable")
    average = (
        sum(row.condition_score for row in checked_today) / len(checked_today)
        if checked_today
        else None
    )
    return WellbeingOverviewResponse(
        summary=WellbeingSummaryResponse(
            players_total=len(memberships),
            attention=attention,
            limited=limited,
            unavailable=unavailable,
            checked_today=len(checked_today),
            average_condition=round(average, 1) if average is not None else None,
        ),
        players=[
            _build_player_response(
                membership,
                readiness.get(membership.id),
                availability.get(membership.id),
                injuries.get(membership.id),
            )
            for membership in memberships
        ],
    )


@router.get(
    "/teams/{team_id}/wellbeing-changes",
    response_model=list[HealthChangeResponse],
)
def list_wellbeing_changes(
    team_id: UUID,
    db: DbSession,
    actor: CurrentActor,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[PlayerHealthChangeModel]:
    require_team_membership(db, team_id, actor, COACHING_ROLES)
    return list(
        db.scalars(
            select(PlayerHealthChangeModel)
            .where(PlayerHealthChangeModel.team_id == team_id)
            .order_by(PlayerHealthChangeModel.created_at.desc())
            .limit(limit)
        ).all()
    )


@router.post(
    "/teams/{team_id}/players/{player_membership_id}/wellbeing-updates",
    response_model=WellbeingUpdateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_wellbeing_update(
    team_id: UUID,
    player_membership_id: UUID,
    payload: WellbeingUpdateCreate,
    db: DbSession,
    actor: CurrentActor,
) -> WellbeingUpdateResponse:
    actor_membership = require_team_membership(db, team_id, actor, COACHING_ROLES)
    require_player_membership(db, team_id, player_membership_id)
    team = db.get(TeamModel, team_id)
    assert team is not None
    now = datetime.now(UTC)
    recorded_on = now.astimezone(ZoneInfo(team.timezone)).date()
    previous_readiness = db.scalar(
        select(PlayerReadinessModel)
        .where(
            PlayerReadinessModel.team_id == team_id,
            PlayerReadinessModel.player_membership_id == player_membership_id,
        )
        .order_by(PlayerReadinessModel.created_at.desc())
        .limit(1)
    )
    previous_availability = db.scalar(
        select(PlayerAvailabilityDecisionModel)
        .where(
            PlayerAvailabilityDecisionModel.team_id == team_id,
            PlayerAvailabilityDecisionModel.player_membership_id == player_membership_id,
            PlayerAvailabilityDecisionModel.is_current.is_(True),
        )
        .with_for_update()
    )
    readiness = PlayerReadinessModel(
        team_id=team_id,
        player_membership_id=player_membership_id,
        recorded_on=recorded_on,
        condition_score=payload.condition_score,
        pain_score=payload.pain_score,
        pain_area=payload.pain_area,
        note=payload.note,
        source_kind=payload.source_kind,
        source_ref=payload.source_ref,
        recorded_by_id=actor.user_id,
        created_at=now,
    )
    db.add(readiness)
    if previous_availability:
        previous_availability.is_current = False
        previous_availability.effective_until = now
    availability = PlayerAvailabilityDecisionModel(
        team_id=team_id,
        player_membership_id=player_membership_id,
        status=payload.status,
        availability=payload.availability,
        restriction=payload.restriction,
        review_at=payload.review_at,
        effective_from=now,
        source_kind=payload.source_kind,
        source_ref=payload.source_ref,
        created_by_id=actor.user_id,
        supersedes_id=previous_availability.id if previous_availability else None,
        version=(previous_availability.version + 1) if previous_availability else 1,
        is_current=True,
    )
    db.add(availability)
    db.flush()

    changes = [
        PlayerHealthChangeModel(
            team_id=team_id,
            player_membership_id=player_membership_id,
            actor_user_id=actor.user_id,
            entity_type="readiness",
            entity_id=readiness.id,
            action="recorded",
            before_value=_readiness_value(previous_readiness),
            after_value=_readiness_value(readiness) or {},
            source=payload.source_kind,
            created_at=now,
        ),
        PlayerHealthChangeModel(
            team_id=team_id,
            player_membership_id=player_membership_id,
            actor_user_id=actor.user_id,
            entity_type="availability",
            entity_id=availability.id,
            action="created" if previous_availability is None else "superseded",
            before_value=_availability_value(previous_availability),
            after_value=_availability_value(availability) or {},
            source=payload.source_kind,
            created_at=now,
        ),
    ]
    db.add_all(changes)

    active_injury = db.scalar(
        select(InjuryCaseModel)
        .where(
            InjuryCaseModel.team_id == team_id,
            InjuryCaseModel.player_membership_id == player_membership_id,
            InjuryCaseModel.status == "open",
        )
        .order_by(InjuryCaseModel.created_at.desc())
        .with_for_update()
    )
    injury_before = _injury_value(active_injury)
    injury_action: str | None = None
    if payload.injury_stage != "none":
        if active_injury is None:
            active_injury = InjuryCaseModel(
                team_id=team_id,
                player_membership_id=player_membership_id,
                stage=payload.injury_stage,
                body_area=payload.pain_area or "미지정",
                occurred_on=recorded_on,
                diagnosis_confirmed=False,
                operational_summary=payload.restriction,
                owner_membership_id=actor_membership.id,
                review_at=payload.review_at,
                created_by_id=actor.user_id,
            )
            db.add(active_injury)
            db.flush()
            injury_action = "opened"
        else:
            active_injury.stage = payload.injury_stage
            active_injury.body_area = payload.pain_area or active_injury.body_area
            active_injury.operational_summary = payload.restriction
            active_injury.review_at = payload.review_at
            active_injury.version += 1
            injury_action = "updated"
    elif active_injury and payload.status == "normal" and payload.availability == "full":
        active_injury.status = "closed"
        active_injury.stage = "returned"
        active_injury.closed_at = now
        active_injury.review_at = None
        active_injury.version += 1
        injury_action = "closed"

    if active_injury and injury_action:
        injury_change = PlayerHealthChangeModel(
            team_id=team_id,
            player_membership_id=player_membership_id,
            actor_user_id=actor.user_id,
            entity_type="injury_case",
            entity_id=active_injury.id,
            action=injury_action,
            before_value=injury_before,
            after_value=_injury_value(active_injury) or {},
            source=payload.source_kind,
            created_at=now,
        )
        db.add(injury_change)
        changes.append(injury_change)

    db.commit()
    membership = db.get(TeamMembershipModel, player_membership_id)
    assert membership is not None
    db.refresh(readiness)
    db.refresh(availability)
    if active_injury:
        db.refresh(active_injury)
    return WellbeingUpdateResponse(
        player=_build_player_response(membership, readiness, availability, active_injury),
        changes=changes,
    )
