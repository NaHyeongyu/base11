from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from clubhaus.core.auth import Actor, get_current_actor
from clubhaus.main import app
from clubhaus.modules.coaching.infrastructure.models.audit import ChangeLogModel
from clubhaus.modules.coaching.infrastructure.models.performance import PerformanceMetricModel
from clubhaus.modules.coaching.infrastructure.models.publications import PublicationModel
from clubhaus.modules.coaching.infrastructure.models.wellbeing import (
    InjuryCaseModel,
    PlayerAvailabilityDecisionModel,
    PlayerHealthChangeModel,
    PlayerReadinessModel,
)
from conftest import PLAYER_MEMBERSHIP_ID, PLAYER_USER_ID, REVIEW_ID, SESSION_ID, TEAM_ID


def test_health_and_team_scope(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok", "service": "clubhaus-api"}

    response = client.get("/api/v1/teams")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": str(TEAM_ID),
            "organization_id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            "name": "FC 안양 U18",
            "age_group": "U18",
            "season": 2026,
            "timezone": "Asia/Seoul",
            "status": "active",
        }
    ]


def test_dashboard_is_session_centered(client: TestClient) -> None:
    response = client.get(f"/api/v1/teams/{TEAM_ID}/dashboard")

    assert response.status_code == 200
    body = response.json()
    assert body["microcycle"]["sessions"][0]["id"] == str(SESSION_ID)
    assert body["counts"] == {
        "open_issues": 1,
        "open_reviews": 1,
        "sessions_total": 1,
        "sessions_with_data": 1,
    }


def test_coach_can_create_player_goal(client: TestClient) -> None:
    response = client.post(
        f"/api/v1/teams/{TEAM_ID}/goals",
        json={
            "player_membership_id": str(PLAYER_MEMBERSHIP_ID),
            "title": "수비 전환 속도",
            "baseline": "복귀 5초",
            "target": "복귀 3초",
            "metric_key": "defensive_transition_seconds",
            "review_date": "2026-08-01",
            "visibility": "player",
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "수비 전환 속도"
    assert response.json()["player_membership_id"] == str(PLAYER_MEMBERSHIP_ID)


def test_session_update_uses_optimistic_lock(client: TestClient, db_session: Session) -> None:
    response = client.patch(
        f"/api/v1/sessions/{SESSION_ID}",
        json={"expected_version": 1, "objective": "수비 전환 속도 개선"},
    )

    assert response.status_code == 200
    assert response.json()["version"] == 2
    assert response.json()["status"] == "draft"
    stale = client.patch(
        f"/api/v1/sessions/{SESSION_ID}",
        json={"expected_version": 1, "objective": "덮어쓰면 안 되는 변경"},
    )
    assert stale.status_code == 409
    assert stale.json()["detail"]["current_version"] == 2
    assert db_session.scalar(select(func.count()).select_from(ChangeLogModel)) == 1


def test_head_coach_decides_staff_review(client: TestClient) -> None:
    response = client.post(
        f"/api/v1/staff-reviews/{REVIEW_ID}/decision",
        json={"decision": "accepted", "note": "35분으로 반영합니다."},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "resolved"
    assert response.json()["decision"] == "accepted"
    repeated = client.post(
        f"/api/v1/staff-reviews/{REVIEW_ID}/decision",
        json={"decision": "rejected", "note": "이미 끝난 검토"},
    )
    assert repeated.status_code == 409


def test_publish_creates_role_specific_payloads(client: TestClient, db_session: Session) -> None:
    response = client.post(f"/api/v1/sessions/{SESSION_ID}/publish")

    assert response.status_code == 200
    assert response.json()["audiences"] == ["player", "staff", "parent"]
    publications = db_session.scalars(
        select(PublicationModel).where(PublicationModel.session_id == SESSION_ID)
    ).all()
    by_audience = {item.audience: item.payload for item in publications}
    assert set(by_audience) == {"player", "staff", "parent"}
    assert "internal_notes" not in by_audience["parent"]
    assert "blocks" in by_audience["staff"]


def test_vendor_neutral_performance_import(client: TestClient, db_session: Session) -> None:
    unknown_player_id = uuid4()
    response = client.post(
        f"/api/v1/teams/{TEAM_ID}/performance-imports",
        json={
            "session_id": str(SESSION_ID),
            "source_vendor": "Catapult",
            "original_filename": "md2.csv",
            "column_mapping": {"Total Distance": "total_distance_m"},
            "rows": [
                {
                    "player_membership_id": str(PLAYER_MEMBERSHIP_ID),
                    "metrics": {"total_distance_m": 6842, "max_speed_kmh": 29.4},
                },
                {
                    "player_membership_id": str(unknown_player_id),
                    "metrics": {"total_distance_m": 5000},
                },
            ],
        },
    )

    assert response.status_code == 201
    assert response.json()["status"] == "needs_review"
    assert response.json()["row_count"] == 2
    assert response.json()["matched_count"] == 1
    metrics = db_session.scalars(select(PerformanceMetricModel)).all()
    assert len(metrics) == 1
    assert metrics[0].metrics["total_distance_m"] == 6842


def test_role_and_team_boundaries_are_enforced(client: TestClient) -> None:
    app.dependency_overrides[get_current_actor] = lambda: Actor(user_id=PLAYER_USER_ID)
    try:
        assert client.get(f"/api/v1/teams/{TEAM_ID}/dashboard").status_code == 403
        assert client.post(f"/api/v1/sessions/{SESSION_ID}/publish").status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_actor, None)


def test_import_rejects_duplicate_player_rows(client: TestClient) -> None:
    row = {
        "player_membership_id": str(PLAYER_MEMBERSHIP_ID),
        "metrics": {"total_distance_m": 6842},
    }
    response = client.post(
        f"/api/v1/teams/{TEAM_ID}/performance-imports",
        json={
            "session_id": str(SESSION_ID),
            "source_vendor": "Generic CSV",
            "original_filename": "duplicate.csv",
            "rows": [row, row],
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Each player may appear only once per import"


def test_wellbeing_update_is_versioned_and_audited(
    client: TestClient, db_session: Session
) -> None:
    overview = client.get(f"/api/v1/teams/{TEAM_ID}/wellbeing")
    assert overview.status_code == 200
    assert overview.json()["summary"]["players_total"] == 1
    assert overview.json()["summary"]["attention"] == 1

    response = client.post(
        f"/api/v1/teams/{TEAM_ID}/players/{PLAYER_MEMBERSHIP_ID}/wellbeing-updates",
        json={
            "condition_score": 5,
            "pain_score": 3,
            "pain_area": "오른쪽 발목",
            "status": "monitor",
            "availability": "limited",
            "injury_stage": "pain_observation",
            "restriction": "최대 60분 · 방향 전환 제한",
            "review_at": "2026-08-29T09:00:00+09:00",
            "note": "훈련 후 재확인",
            "source_kind": "wellbeing",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["player"]["availability"]["version"] == 1
    assert body["player"]["active_injury"]["stage"] == "pain_observation"
    assert len(body["changes"]) == 3
    assert db_session.scalar(select(func.count()).select_from(PlayerReadinessModel)) == 1
    assert (
        db_session.scalar(select(func.count()).select_from(PlayerAvailabilityDecisionModel))
        == 1
    )
    assert db_session.scalar(select(func.count()).select_from(InjuryCaseModel)) == 1
    assert db_session.scalar(select(func.count()).select_from(PlayerHealthChangeModel)) == 3

    recovered = client.post(
        f"/api/v1/teams/{TEAM_ID}/players/{PLAYER_MEMBERSHIP_ID}/wellbeing-updates",
        json={
            "condition_score": 8,
            "pain_score": 0,
            "pain_area": None,
            "status": "normal",
            "availability": "full",
            "injury_stage": "none",
            "restriction": "제한 없음",
            "review_at": None,
            "source_kind": "medical",
        },
    )
    assert recovered.status_code == 201
    assert recovered.json()["player"]["availability"]["version"] == 2
    assert recovered.json()["player"]["active_injury"]["status"] == "closed"
    current_decisions = db_session.scalars(
        select(PlayerAvailabilityDecisionModel).where(
            PlayerAvailabilityDecisionModel.is_current.is_(True)
        )
    ).all()
    assert len(current_decisions) == 1
    assert current_decisions[0].status == "normal"


def test_wellbeing_rejects_inconsistent_state(client: TestClient) -> None:
    response = client.post(
        f"/api/v1/teams/{TEAM_ID}/players/{PLAYER_MEMBERSHIP_ID}/wellbeing-updates",
        json={
            "condition_score": 5,
            "pain_score": 3,
            "pain_area": "오른쪽 발목",
            "status": "normal",
            "availability": "limited",
            "injury_stage": "pain_observation",
            "restriction": "최대 60분",
            "source_kind": "wellbeing",
        },
    )
    assert response.status_code == 422
