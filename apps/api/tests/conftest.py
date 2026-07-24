from collections.abc import Generator
from datetime import UTC, date, datetime
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from clubhaus.core.database import Base, get_db
from clubhaus.main import app
from clubhaus.modules.coaching.infrastructure.models.performance import PerformanceImportModel
from clubhaus.modules.coaching.infrastructure.models.planning import (
    MatchModel,
    MicrocycleModel,
    SessionBlockModel,
    TrainingSessionModel,
)
from clubhaus.modules.coaching.infrastructure.models.player_development import PlayerIssueModel
from clubhaus.modules.coaching.infrastructure.models.staff_reviews import StaffReviewModel
from clubhaus.modules.teams.infrastructure.models import (
    OrganizationModel,
    TeamMembershipModel,
    TeamModel,
    UserModel,
)

ORGANIZATION_ID = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
TEAM_ID = UUID("11111111-1111-4111-8111-111111111111")
COACH_USER_ID = UUID("22222222-2222-4222-8222-222222222222")
COACH_MEMBERSHIP_ID = UUID("33333333-3333-4333-8333-333333333333")
PLAYER_USER_ID = UUID("88888888-8888-4888-8888-888888888888")
PLAYER_MEMBERSHIP_ID = UUID("99999999-9999-4999-8999-999999999999")
SESSION_ID = UUID("cccccccc-cccc-4ccc-8ccc-cccccccccccc")
REVIEW_ID = UUID("dddddddd-dddd-4ddd-8ddd-dddddddddddd")


@pytest.fixture
def db_session() -> Generator[Session]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    test_session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    with test_session_factory() as db:
        _seed_test_database(db)
        yield db
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient]:
    def override_get_db() -> Generator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _seed_test_database(db: Session) -> None:
    organization = OrganizationModel(id=ORGANIZATION_ID, name="FC 안양 아카데미")
    coach = UserModel(
        id=COACH_USER_ID,
        external_subject="local-coach",
        display_name="김태호",
        email="coach@base11.local",
    )
    player = UserModel(id=PLAYER_USER_ID, display_name="이도윤")
    team = TeamModel(
        id=TEAM_ID,
        organization_id=ORGANIZATION_ID,
        name="FC 안양 U18",
        age_group="U18",
        season=2026,
    )
    coach_membership = TeamMembershipModel(
        id=COACH_MEMBERSHIP_ID,
        team_id=TEAM_ID,
        user_id=COACH_USER_ID,
        role="head_coach",
        staff_scope="team",
    )
    player_membership = TeamMembershipModel(
        id=PLAYER_MEMBERSHIP_ID,
        team_id=TEAM_ID,
        user_id=PLAYER_USER_ID,
        role="player",
        position="DF",
        grade="2학년",
        squad_number=4,
    )
    match = MatchModel(
        team_id=TEAM_ID,
        opponent="수원FC U18",
        competition="K리그 주니어 13R",
        kickoff_at=datetime(2026, 7, 20, 6, 0, tzinfo=UTC),
        venue="수원월드컵 보조구장",
        home_away="away",
    )
    microcycle = MicrocycleModel(
        team_id=TEAM_ID,
        match=match,
        week_start=date(2026, 7, 14),
        title="수원FC전 마이크로사이클",
        status="review",
        created_by_id=COACH_USER_ID,
    )
    training_session = TrainingSessionModel(
        id=SESSION_ID,
        team_id=TEAM_ID,
        day_code="MD-2",
        title="포지션 훈련",
        objective="수원FC전 역할 정교화",
        scheduled_at=datetime(2026, 7, 18, 8, 0, tzinfo=UTC),
        duration_minutes=120,
        intensity="medium",
        location="안양 보조구장",
        status="reviewed",
    )
    training_session.blocks = [
        SessionBlockModel(
            sort_order=0,
            title="전환 게임 8v8+3",
            duration_minutes=30,
            intensity="high",
            group_name="전체",
            owner_membership_id=COACH_MEMBERSHIP_ID,
        )
    ]
    microcycle.sessions = [training_session]
    db.add_all([organization, coach, player, team, coach_membership, player_membership, microcycle])
    db.flush()
    db.add_all(
        [
            StaffReviewModel(
                id=REVIEW_ID,
                team_id=TEAM_ID,
                session_id=SESSION_ID,
                author_membership_id=COACH_MEMBERSHIP_ID,
                message="전환 게임 시간을 늘려주세요.",
                proposed_changes={"duration_minutes": 35},
            ),
            PlayerIssueModel(
                team_id=TEAM_ID,
                player_membership_id=PLAYER_MEMBERSHIP_ID,
                session_id=SESSION_ID,
                issue_type="pain",
                severity="high",
                detail="왼쪽 발목 통증 4/10",
                restriction="전환 게임 제외",
            ),
            PerformanceImportModel(
                team_id=TEAM_ID,
                session_id=SESSION_ID,
                source_vendor="STATSports",
                original_filename="existing.xlsx",
                column_mapping={},
                row_count=1,
                matched_count=1,
                status="completed",
                imported_by_id=COACH_USER_ID,
            ),
        ]
    )
    db.commit()
