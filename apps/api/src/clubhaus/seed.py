from datetime import date, datetime
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import select

from clubhaus.core.database import SessionFactory
from clubhaus.modules.coaching.infrastructure.models.performance import (
    PerformanceImportModel,
    PerformanceMetricModel,
)
from clubhaus.modules.coaching.infrastructure.models.planning import (
    MatchModel,
    MicrocycleModel,
    SessionBlockModel,
    TrainingSessionModel,
)
from clubhaus.modules.coaching.infrastructure.models.player_development import (
    PlayerGoalModel,
    PlayerIssueModel,
)
from clubhaus.modules.coaching.infrastructure.models.staff_reviews import StaffReviewModel
from clubhaus.modules.teams.infrastructure.models import (
    OrganizationModel,
    TeamMembershipModel,
    TeamModel,
    UserModel,
)

ORGANIZATION_ID = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
TEAM_ID = UUID("11111111-1111-4111-8111-111111111111")
HEAD_COACH_USER_ID = UUID("22222222-2222-4222-8222-222222222222")
HEAD_COACH_MEMBERSHIP_ID = UUID("33333333-3333-4333-8333-333333333333")
ASSISTANT_USER_ID = UUID("44444444-4444-4444-8444-444444444444")
ASSISTANT_MEMBERSHIP_ID = UUID("55555555-5555-4555-8555-555555555555")
MEDICAL_USER_ID = UUID("66666666-6666-4666-8666-666666666666")
MEDICAL_MEMBERSHIP_ID = UUID("77777777-7777-4777-8777-777777777777")
PLAYER_USER_ID = UUID("88888888-8888-4888-8888-888888888888")
PLAYER_MEMBERSHIP_ID = UUID("99999999-9999-4999-8999-999999999999")
MATCH_ID = UUID("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")
MICROCYCLE_ID = UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")
SESSION_MD2_ID = UUID("cccccccc-cccc-4ccc-8ccc-cccccccccccc")
SESSION_MD1_ID = UUID("dddddddd-dddd-4ddd-8ddd-dddddddddddd")
SESSION_MD_ID = UUID("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee")


def seed() -> None:
    seoul = ZoneInfo("Asia/Seoul")
    with SessionFactory() as db:
        if db.scalar(select(TeamModel.id).where(TeamModel.id == TEAM_ID)) is not None:
            print("Seed already present")
            return

        organization = OrganizationModel(id=ORGANIZATION_ID, name="FC 안양 아카데미")
        head_coach = UserModel(
            id=HEAD_COACH_USER_ID,
            external_subject="local-coach",
            display_name="김태호",
            email="coach@base11.local",
        )
        assistant = UserModel(id=ASSISTANT_USER_ID, display_name="박성진")
        medical = UserModel(id=MEDICAL_USER_ID, display_name="최은지")
        player = UserModel(id=PLAYER_USER_ID, display_name="이도윤")
        team = TeamModel(
            id=TEAM_ID,
            organization_id=ORGANIZATION_ID,
            name="FC 안양 U18",
            age_group="U18",
            season=2026,
        )
        memberships = [
            TeamMembershipModel(
                id=HEAD_COACH_MEMBERSHIP_ID,
                team_id=TEAM_ID,
                user_id=HEAD_COACH_USER_ID,
                role="head_coach",
                staff_scope="team",
            ),
            TeamMembershipModel(
                id=ASSISTANT_MEMBERSHIP_ID,
                team_id=TEAM_ID,
                user_id=ASSISTANT_USER_ID,
                role="coach",
                staff_scope="attack",
            ),
            TeamMembershipModel(
                id=MEDICAL_MEMBERSHIP_ID,
                team_id=TEAM_ID,
                user_id=MEDICAL_USER_ID,
                role="medical",
                staff_scope="medical",
            ),
            TeamMembershipModel(
                id=PLAYER_MEMBERSHIP_ID,
                team_id=TEAM_ID,
                user_id=PLAYER_USER_ID,
                role="player",
                position="DF",
                grade="2학년",
                squad_number=4,
            ),
        ]
        match = MatchModel(
            id=MATCH_ID,
            team_id=TEAM_ID,
            opponent="수원FC U18",
            competition="K리그 주니어 13R",
            kickoff_at=datetime(2026, 7, 20, 15, 0, tzinfo=seoul),
            venue="수원월드컵 보조구장",
            home_away="away",
        )
        microcycle = MicrocycleModel(
            id=MICROCYCLE_ID,
            team_id=TEAM_ID,
            match=match,
            week_start=date(2026, 7, 14),
            title="수원FC전 마이크로사이클",
            status="review",
            created_by_id=HEAD_COACH_USER_ID,
        )
        md2 = TrainingSessionModel(
            id=SESSION_MD2_ID,
            team_id=TEAM_ID,
            day_code="MD-2",
            title="포지션 훈련",
            objective="수원FC전 역할 정교화",
            scheduled_at=datetime(2026, 7, 18, 17, 0, tzinfo=seoul),
            duration_minutes=120,
            intensity="medium",
            location="안양 보조구장",
            status="reviewed",
            internal_notes="발목 제한 선수는 전환 게임 제외",
        )
        md2.blocks = [
            SessionBlockModel(
                sort_order=0,
                title="프리액티베이션",
                duration_minutes=15,
                intensity="low",
                group_name="전체",
                owner_membership_id=MEDICAL_MEMBERSHIP_ID,
            ),
            SessionBlockModel(
                sort_order=1,
                title="포지션별 패턴",
                duration_minutes=25,
                intensity="medium",
                group_name="공격·미드필더",
                owner_membership_id=ASSISTANT_MEMBERSHIP_ID,
            ),
            SessionBlockModel(
                sort_order=2,
                title="전환 게임 8v8+3",
                duration_minutes=30,
                intensity="high",
                group_name="전체",
                owner_membership_id=HEAD_COACH_MEMBERSHIP_ID,
                coaching_points="공을 잃은 순간 5초 압박",
            ),
        ]
        md1 = TrainingSessionModel(
            id=SESSION_MD1_ID,
            team_id=TEAM_ID,
            day_code="MD-1",
            title="세트피스",
            objective="공격·수비 세트피스",
            scheduled_at=datetime(2026, 7, 19, 10, 0, tzinfo=seoul),
            duration_minutes=65,
            intensity="low",
            location="안양 보조구장",
        )
        match_session = TrainingSessionModel(
            id=SESSION_MD_ID,
            team_id=TEAM_ID,
            day_code="MD",
            title="수원FC U18전",
            objective="K리그 주니어 13R",
            scheduled_at=datetime(2026, 7, 20, 15, 0, tzinfo=seoul),
            duration_minutes=90,
            intensity="match",
            location="수원월드컵 보조구장",
            status="published",
        )
        microcycle.sessions = [md2, md1, match_session]

        db.add_all([organization, head_coach, assistant, medical, player, team, *memberships])
        db.add(microcycle)
        db.flush()

        db.add_all(
            [
                StaffReviewModel(
                    team_id=TEAM_ID,
                    session_id=SESSION_MD2_ID,
                    author_membership_id=ASSISTANT_MEMBERSHIP_ID,
                    message="공격조 전환 게임을 12분으로 늘려주세요.",
                    proposed_changes={"block": "전환 게임 8v8+3", "duration_minutes": 35},
                ),
                PlayerGoalModel(
                    team_id=TEAM_ID,
                    player_membership_id=PLAYER_MEMBERSHIP_ID,
                    title="수비 전환 3초 안에 복귀",
                    baseline="최근 5경기 평균 4.1초",
                    target="3.0초 이하",
                    metric_key="defensive_transition_seconds",
                    progress_percent=54,
                    review_date=date(2026, 7, 23),
                    created_by_id=HEAD_COACH_USER_ID,
                ),
                PlayerIssueModel(
                    team_id=TEAM_ID,
                    player_membership_id=PLAYER_MEMBERSHIP_ID,
                    session_id=SESSION_MD2_ID,
                    issue_type="pain",
                    severity="high",
                    detail="왼쪽 발목 통증 4/10",
                    restriction="전환 게임 제외",
                    owner_membership_id=MEDICAL_MEMBERSHIP_ID,
                ),
            ]
        )
        performance_import = PerformanceImportModel(
            team_id=TEAM_ID,
            session_id=SESSION_MD2_ID,
            source_vendor="STATSports",
            original_filename="MD-2_position_20260718.xlsx",
            object_key="local/MD-2_position_20260718.xlsx",
            column_mapping={"Athlete Name": "player", "Total Distance (m)": "total_distance_m"},
            row_count=1,
            matched_count=1,
            status="completed",
            imported_by_id=HEAD_COACH_USER_ID,
        )
        performance_import.metrics = [
            PerformanceMetricModel(
                team_id=TEAM_ID,
                session_id=SESSION_MD2_ID,
                player_membership_id=PLAYER_MEMBERSHIP_ID,
                metrics={"total_distance_m": 6842, "max_speed_kmh": 29.4, "rpe": 6},
            )
        ]
        db.add(performance_import)
        db.commit()
        print(f"Seeded team {TEAM_ID}")


if __name__ == "__main__":
    seed()
