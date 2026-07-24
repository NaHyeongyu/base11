from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from clubhaus.core.auth import Actor, get_current_actor
from clubhaus.main import app
from clubhaus.modules.coaching.infrastructure.models.audit import ChangeLogModel
from clubhaus.modules.coaching.infrastructure.models.performance import PerformanceMetricModel
from clubhaus.modules.coaching.infrastructure.models.publications import PublicationModel
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
