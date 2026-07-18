from fastapi.testclient import TestClient

from clubhaus.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "clubhaus-api"}


def test_team_query_uses_organization_scope() -> None:
    response = client.get(
        "/api/v1/teams",
        params={"organization_id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"},
    )

    assert response.status_code == 200
    assert response.json()[0]["name"] == "FC 안양 U18"
