from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm.exc import StaleDataError

from clubhaus.core.auth import CurrentActor
from clubhaus.modules.coaching.access import HEAD_COACH_ROLES, require_team_membership
from clubhaus.modules.coaching.api.contracts.publications import PublicationResponse
from clubhaus.modules.coaching.api.dependencies import DbSession, load_session
from clubhaus.modules.coaching.application.publications import build_publication_payloads
from clubhaus.modules.coaching.infrastructure.models.publications import PublicationModel
from clubhaus.modules.coaching.infrastructure.records import add_change_log

router = APIRouter(tags=["coaching"])


@router.post("/sessions/{session_id}/publish", response_model=PublicationResponse)
def publish_session(session_id: UUID, db: DbSession, actor: CurrentActor) -> PublicationResponse:
    training_session = load_session(db, session_id)
    require_team_membership(db, training_session.team_id, actor, HEAD_COACH_ROLES)
    now = datetime.now(UTC)
    payloads = build_publication_payloads(training_session)
    for audience, audience_payload in payloads.items():
        db.add(
            PublicationModel(
                team_id=training_session.team_id,
                session_id=training_session.id,
                audience=audience,
                payload=audience_payload,
                published_by_id=actor.user_id,
                published_at=now,
            )
        )
    training_session.status = "published"
    add_change_log(
        db,
        team_id=training_session.team_id,
        actor_id=actor.user_id,
        entity_type="session",
        entity_id=training_session.id,
        action="published",
        changes={"audiences": list(payloads)},
    )
    try:
        db.commit()
    except StaleDataError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session changed while publishing",
        ) from error
    return PublicationResponse(
        session_id=training_session.id,
        session_status=training_session.status,
        version=training_session.version,
        audiences=list(payloads),
        published_at=now,
    )
