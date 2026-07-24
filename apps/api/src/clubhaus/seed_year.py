from __future__ import annotations

import argparse
import json
import random
import sys
from collections.abc import Iterable, Sequence
from datetime import date, datetime, time, timedelta
from pathlib import Path
from typing import Any
from uuid import UUID, uuid5
from zoneinfo import ZoneInfo

NAMESPACE = UUID("6f3db130-2598-4e32-92fc-2cf9dc7eae11")
SEOUL = ZoneInfo("Asia/Seoul")
TODAY = date(2026, 7, 19)

ORGANIZATION_ID = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
TEAM_ID = UUID("11111111-1111-4111-8111-111111111111")
HEAD_COACH_USER_ID = UUID("22222222-2222-4222-8222-222222222222")
HEAD_COACH_MEMBERSHIP_ID = UUID("33333333-3333-4333-8333-333333333333")
ASSISTANT_USER_ID = UUID("44444444-4444-4444-8444-444444444444")
ASSISTANT_MEMBERSHIP_ID = UUID("55555555-5555-4555-8555-555555555555")
MEDICAL_USER_ID = UUID("66666666-6666-4666-8666-666666666666")
MEDICAL_MEMBERSHIP_ID = UUID("77777777-7777-4777-8777-777777777777")
EXISTING_PLAYER_USER_ID = UUID("88888888-8888-4888-8888-888888888888")
EXISTING_PLAYER_MEMBERSHIP_ID = UUID("99999999-9999-4999-8999-999999999999")

SPECIAL_MATCH_ID = UUID("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")
SPECIAL_MICROCYCLE_ID = UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")
SPECIAL_SESSION_IDS = {
    "MD-2": UUID("cccccccc-cccc-4ccc-8ccc-cccccccccccc"),
    "MD-1": UUID("dddddddd-dddd-4ddd-8ddd-dddddddddddd"),
    "MD": UUID("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"),
}

Row = tuple[Any, ...]
Dataset = dict[str, list[Row]]

ROSTER = [
    (1, "김준서", "GK", "3학년"),
    (2, "박지훈", "DF", "3학년"),
    (3, "최민재", "DF", "3학년"),
    (4, "이도윤", "DF", "2학년"),
    (5, "정우진", "DF", "2학년"),
    (6, "한서준", "MF", "3학년"),
    (7, "윤지호", "MF", "3학년"),
    (8, "강민혁", "MF", "2학년"),
    (9, "오현우", "FW", "3학년"),
    (10, "송재민", "FW", "2학년"),
    (11, "임도현", "FW", "3학년"),
    (12, "조승민", "GK", "2학년"),
    (13, "백승우", "DF", "1학년"),
    (14, "신민규", "DF", "2학년"),
    (15, "권태윤", "MF", "1학년"),
    (16, "홍성민", "MF", "2학년"),
    (17, "장우혁", "FW", "1학년"),
    (18, "유재현", "DF", "3학년"),
    (19, "문시우", "MF", "1학년"),
    (20, "안준혁", "FW", "2학년"),
    (21, "서하준", "DF", "1학년"),
    (22, "노건우", "MF", "3학년"),
    (23, "배지환", "FW", "1학년"),
    (24, "황도윤", "GK", "1학년"),
]

OPPONENTS = [
    "수원FC U18",
    "FC서울 U18",
    "인천Utd U18",
    "성남FC U18",
    "서울E U18",
    "부천FC U18",
    "김포FC U18",
    "충남아산 U18",
    "대전하나 U18",
    "전북현대 U18",
    "포항스틸러스 U18",
    "울산HD U18",
    "광주FC U18",
]

TABLE_COLUMNS: dict[str, Sequence[str]] = {
    "organizations": ("id", "name"),
    "users": ("id", "external_subject", "display_name", "email"),
    "teams": ("id", "organization_id", "name", "age_group", "season", "timezone", "status"),
    "team_memberships": (
        "id",
        "team_id",
        "user_id",
        "role",
        "staff_scope",
        "position",
        "grade",
        "squad_number",
        "active",
    ),
    "matches": (
        "id",
        "team_id",
        "opponent",
        "competition",
        "kickoff_at",
        "venue",
        "home_away",
        "status",
    ),
    "microcycles": (
        "id",
        "team_id",
        "match_id",
        "week_start",
        "title",
        "status",
        "created_by_id",
        "published_at",
    ),
    "training_sessions": (
        "id",
        "team_id",
        "microcycle_id",
        "day_code",
        "title",
        "objective",
        "scheduled_at",
        "duration_minutes",
        "intensity",
        "location",
        "status",
        "version",
        "internal_notes",
    ),
    "session_blocks": (
        "id",
        "session_id",
        "sort_order",
        "title",
        "duration_minutes",
        "intensity",
        "group_name",
        "owner_membership_id",
        "coaching_points",
    ),
    "staff_reviews": (
        "id",
        "team_id",
        "session_id",
        "author_membership_id",
        "message",
        "proposed_changes",
        "status",
        "decision",
        "decision_note",
        "decided_by_id",
        "decided_at",
    ),
    "player_goals": (
        "id",
        "team_id",
        "player_membership_id",
        "title",
        "baseline",
        "target",
        "metric_key",
        "progress_percent",
        "review_date",
        "status",
        "visibility",
        "created_by_id",
    ),
    "player_issues": (
        "id",
        "team_id",
        "player_membership_id",
        "session_id",
        "issue_type",
        "severity",
        "detail",
        "restriction",
        "owner_membership_id",
        "status",
        "resolved_at",
    ),
    "performance_imports": (
        "id",
        "team_id",
        "session_id",
        "source_vendor",
        "original_filename",
        "object_key",
        "column_mapping",
        "row_count",
        "matched_count",
        "status",
        "imported_by_id",
    ),
    "performance_metrics": (
        "id",
        "import_id",
        "team_id",
        "session_id",
        "player_membership_id",
        "metrics",
    ),
    "publications": (
        "id",
        "team_id",
        "session_id",
        "audience",
        "payload",
        "published_by_id",
        "published_at",
    ),
    "change_logs": (
        "id",
        "team_id",
        "actor_user_id",
        "entity_type",
        "entity_id",
        "action",
        "changes",
        "created_at",
    ),
}


def stable_id(key: str) -> UUID:
    return uuid5(NAMESPACE, key)


def at(day: date, hour: int, minute: int = 0) -> datetime:
    return datetime.combine(day, time(hour, minute), tzinfo=SEOUL)


def build_dataset(year: int = 2026) -> Dataset:
    rng = random.Random(year)
    rows: Dataset = {table: [] for table in TABLE_COLUMNS}
    rows["organizations"].append((ORGANIZATION_ID, "FC 안양 아카데미"))
    rows["teams"].append(
        (TEAM_ID, ORGANIZATION_ID, "FC 안양 U18", "U18", year, "Asia/Seoul", "active")
    )

    staff = [
        (
            HEAD_COACH_USER_ID,
            HEAD_COACH_MEMBERSHIP_ID,
            "local-coach",
            "김태호",
            "coach@base11.local",
            "head_coach",
            "team",
        ),
        (ASSISTANT_USER_ID, ASSISTANT_MEMBERSHIP_ID, None, "박성진", None, "coach", "attack"),
        (MEDICAL_USER_ID, MEDICAL_MEMBERSHIP_ID, None, "최은지", None, "medical", "medical"),
        (
            stable_id(f"{year}:staff-user:gk"),
            stable_id(f"{year}:staff-membership:gk"),
            None,
            "이현석",
            None,
            "coach",
            "goalkeeper",
        ),
        (
            stable_id(f"{year}:staff-user:analyst"),
            stable_id(f"{year}:staff-membership:analyst"),
            None,
            "정수빈",
            None,
            "coach",
            "analysis",
        ),
    ]
    for user_id, membership_id, subject, name, email, role, scope in staff:
        rows["users"].append((user_id, subject, name, email))
        rows["team_memberships"].append(
            (membership_id, TEAM_ID, user_id, role, scope, None, None, None, True)
        )

    players: list[tuple[UUID, int, str, str, str]] = []
    for squad_number, name, position, grade in ROSTER:
        if squad_number == 4:
            user_id = EXISTING_PLAYER_USER_ID
            membership_id = EXISTING_PLAYER_MEMBERSHIP_ID
        else:
            user_id = stable_id(f"{year}:player-user:{squad_number}")
            membership_id = stable_id(f"{year}:player-membership:{squad_number}")
        players.append((membership_id, squad_number, name, position, grade))
        rows["users"].append((user_id, None, name, None))
        rows["team_memberships"].append(
            (
                membership_id,
                TEAM_ID,
                user_id,
                "player",
                None,
                position,
                grade,
                squad_number,
                True,
            )
        )

    first_monday = date(year, 1, 1)
    first_monday += timedelta(days=(7 - first_monday.weekday()) % 7)
    training_blueprints = [
        ("MD-4", 1, 17, 0, "회복·기술", "회복과 기본 기술 정교화", 105, "medium"),
        ("MD-3", 2, 17, 0, "전술 원칙", "상대 전형에 따른 팀 전술", 110, "high"),
        ("MD-2", 3, 17, 0, "포지션 훈련", "포지션별 역할과 전환", 90, "medium"),
        ("MD-1", 4, 16, 30, "세트피스", "경기 계획과 세트피스", 65, "low"),
    ]
    past_training_sessions: list[tuple[UUID, date, str, str]] = []
    session_for_week: dict[int, list[UUID]] = {}

    for week_index in range(52):
        week_start = first_monday + timedelta(weeks=week_index)
        special_week = year == 2026 and week_start == date(2026, 7, 13)
        match_day = date(2026, 7, 20) if special_week else week_start + timedelta(days=6)
        opponent = "수원FC U18" if special_week else OPPONENTS[week_index % len(OPPONENTS)]
        match_id = SPECIAL_MATCH_ID if special_week else stable_id(f"{year}:match:{week_index}")
        microcycle_id = (
            SPECIAL_MICROCYCLE_ID if special_week else stable_id(f"{year}:microcycle:{week_index}")
        )
        if week_index < 8:
            competition = f"동계 친선 {week_index + 1}차전"
        elif 22 <= week_index <= 31 and week_index % 3 == 0:
            competition = "전국고등축구대회"
        else:
            competition = f"K리그 주니어 {max(1, week_index - 7)}R"
        kickoff = at(match_day, 15)
        match_status = "completed" if match_day < TODAY else "scheduled"
        home_away = ("home", "away", "neutral")[week_index % 3]
        venue = "안양종합운동장 보조구장" if home_away == "home" else f"{opponent} 훈련장"
        rows["matches"].append(
            (
                match_id,
                TEAM_ID,
                opponent,
                competition,
                kickoff,
                venue,
                home_away,
                match_status,
            )
        )
        cycle_status = (
            "completed"
            if match_day < TODAY
            else "published"
            if match_day <= TODAY + timedelta(days=14)
            else "draft"
        )
        published_at = at(week_start, 9) if cycle_status != "draft" else None
        rows["microcycles"].append(
            (
                microcycle_id,
                TEAM_ID,
                match_id,
                date(2026, 7, 14) if special_week else week_start,
                f"{opponent}전 마이크로사이클",
                cycle_status,
                HEAD_COACH_USER_ID,
                published_at,
            )
        )

        week_session_ids: list[UUID] = []
        for (
            day_code,
            day_offset,
            hour,
            minute,
            title,
            objective,
            duration,
            intensity,
        ) in training_blueprints:
            session_day = (
                {
                    "MD-4": date(2026, 7, 16),
                    "MD-3": date(2026, 7, 17),
                    "MD-2": date(2026, 7, 18),
                    "MD-1": date(2026, 7, 19),
                }[day_code]
                if special_week
                else week_start + timedelta(days=day_offset)
            )
            session_id = SPECIAL_SESSION_IDS.get(day_code) if special_week else None
            session_id = session_id or stable_id(f"{year}:session:{week_index}:{day_code}")
            week_session_ids.append(session_id)
            session_status = (
                "completed"
                if session_day < TODAY
                else "published"
                if session_day <= TODAY + timedelta(days=14)
                else "draft"
            )
            internal_notes = "부하 반응과 제한 선수를 세션 전 확인" if intensity == "high" else None
            rows["training_sessions"].append(
                (
                    session_id,
                    TEAM_ID,
                    microcycle_id,
                    day_code,
                    title,
                    objective,
                    at(session_day, hour, minute),
                    duration,
                    intensity,
                    "안양종합운동장 보조구장",
                    session_status,
                    1,
                    internal_notes,
                )
            )
            block_specs = [
                ("프리액티베이션", 15, "low", "전체", MEDICAL_MEMBERSHIP_ID, "통증·가동범위 확인"),
                (
                    "포지션별 원칙",
                    max(20, duration // 3),
                    intensity,
                    "포지션 그룹",
                    ASSISTANT_MEMBERSHIP_ID,
                    objective,
                ),
                (
                    "게임 모델",
                    duration - 15 - max(20, duration // 3),
                    intensity,
                    "전체",
                    HEAD_COACH_MEMBERSHIP_ID,
                    "훈련 원칙을 경기 상황에 연결",
                ),
            ]
            for order, block in enumerate(block_specs):
                rows["session_blocks"].append(
                    (
                        stable_id(f"{year}:block:{week_index}:{day_code}:{order}"),
                        session_id,
                        order,
                        *block,
                    )
                )
            if session_day < TODAY and not (special_week and day_code == "MD-2"):
                past_training_sessions.append((session_id, session_day, day_code, intensity))

        match_session_id = (
            SPECIAL_SESSION_IDS["MD"]
            if special_week
            else stable_id(f"{year}:session:{week_index}:MD")
        )
        week_session_ids.append(match_session_id)
        rows["training_sessions"].append(
            (
                match_session_id,
                TEAM_ID,
                microcycle_id,
                "MD",
                f"{opponent}전",
                competition,
                kickoff,
                90,
                "match",
                venue,
                "completed"
                if match_day < TODAY
                else "published"
                if match_day <= TODAY + timedelta(days=14)
                else "draft",
                1,
                None,
            )
        )
        session_for_week[week_index] = week_session_ids

        if not special_week and week_index % 2 == 0:
            resolved = match_day < TODAY - timedelta(days=7)
            review_session_id = week_session_ids[1]
            decided_at = at(week_start + timedelta(days=2), 11) if resolved else None
            rows["staff_reviews"].append(
                (
                    stable_id(f"{year}:review:{week_index}"),
                    TEAM_ID,
                    review_session_id,
                    ASSISTANT_MEMBERSHIP_ID,
                    "상대 빌드업 대응 시간을 10분 늘리는 안을 제안합니다.",
                    {"block": "게임 모델", "duration_delta": 10},
                    "resolved" if resolved else "open",
                    "accepted" if resolved else None,
                    "전술 블록에 반영" if resolved else None,
                    HEAD_COACH_USER_ID if resolved else None,
                    decided_at,
                )
            )

        publish_until = TODAY + timedelta(days=14)
        if week_start <= publish_until:
            for session_id in week_session_ids:
                for audience in ("player", "staff", "parent"):
                    payload = {
                        "week": week_index + 1,
                        "opponent": opponent,
                        "competition": competition,
                        "audience": audience,
                    }
                    if audience == "staff":
                        payload["internal_focus"] = "경기 모델과 부하 계획 확인"
                    rows["publications"].append(
                        (
                            stable_id(f"{year}:publication:{session_id}:{audience}"),
                            TEAM_ID,
                            session_id,
                            audience,
                            payload,
                            HEAD_COACH_USER_ID,
                            published_at or at(week_start, 9),
                        )
                    )

        rows["change_logs"].append(
            (
                stable_id(f"{year}:change-log:microcycle:{week_index}"),
                TEAM_ID,
                HEAD_COACH_USER_ID,
                "microcycle",
                microcycle_id,
                "created",
                {"week": week_index + 1, "opponent": opponent},
                at(week_start, 8, 30),
            )
        )

    vendors = ["STATSports", "Catapult", "Polar", "Generic CSV"]
    vendor_mapping = {
        "Athlete": "player",
        "Total Distance": "total_distance_m",
        "Max Speed": "max_speed_kmh",
        "High Speed Running": "high_speed_distance_m",
    }
    for import_index, (session_id, session_day, day_code, intensity) in enumerate(
        past_training_sessions
    ):
        vendor = vendors[import_index % len(vendors)]
        import_id = stable_id(f"{year}:performance-import:{session_id}")
        rows["performance_imports"].append(
            (
                import_id,
                TEAM_ID,
                session_id,
                vendor,
                f"{session_day.isoformat()}_{day_code}_{vendor.lower().replace(' ', '-')}.csv",
                f"mock/{year}/{session_id}.csv",
                vendor_mapping,
                len(players),
                len(players),
                "completed",
                HEAD_COACH_USER_ID,
            )
        )
        intensity_rpe = {"low": 4, "medium": 6, "high": 8}[intensity]
        for membership_id, squad_number, _name, position, _grade in players:
            position_factor = {"GK": 0.72, "DF": 0.96, "MF": 1.06, "FW": 1.0}[position]
            distance = int((6300 + rng.randint(-650, 900)) * position_factor)
            max_speed = round(27.0 + rng.random() * 5.2 - (1.6 if position == "GK" else 0), 1)
            metrics = {
                "total_distance_m": distance,
                "high_speed_distance_m": max(180, int(distance * (0.06 + rng.random() * 0.05))),
                "max_speed_kmh": max_speed,
                "rpe": max(1, min(10, intensity_rpe + rng.choice([-1, 0, 0, 1]))),
                "squad_number": squad_number,
            }
            rows["performance_metrics"].append(
                (
                    stable_id(f"{year}:performance-metric:{import_id}:{membership_id}"),
                    import_id,
                    TEAM_ID,
                    session_id,
                    membership_id,
                    metrics,
                )
            )

    goal_templates = [
        ("고강도 러닝 반복 능력", "high_speed_distance_m", "평균 420m", "평균 520m"),
        ("포지션 핵심 행동 안정화", "coach_rating", "평균 3.1/5", "평균 4.0/5"),
    ]
    for membership_id, squad_number, _name, _position, _grade in players:
        for goal_index, (title, metric_key, baseline, target) in enumerate(goal_templates):
            review_date = date(year, 6 if goal_index == 0 else 11, 30)
            status = "completed" if review_date < TODAY else "active"
            rows["player_goals"].append(
                (
                    stable_id(f"{year}:goal:{membership_id}:{goal_index}"),
                    TEAM_ID,
                    membership_id,
                    title,
                    baseline,
                    target,
                    metric_key,
                    100 if status == "completed" else 35 + squad_number % 45,
                    review_date,
                    status,
                    "player",
                    HEAD_COACH_USER_ID,
                )
            )

    issue_details = [
        ("pain", "medium", "햄스트링 뻐근함 3/10", "고속 달리기 제한"),
        ("load", "low", "주간 부하 상승", "세션 볼륨 15% 조정"),
        ("pain", "high", "발목 충돌 후 통증 5/10", "대인 훈련 제외"),
    ]
    issue_start = date(year, 1, 20)
    for issue_index in range(24):
        issue_day = issue_start + timedelta(days=issue_index * 14)
        player = players[(issue_index * 5) % len(players)]
        week_index = min(51, max(0, (issue_day - first_monday).days // 7))
        linked_session = session_for_week[week_index][2]
        issue_type, severity, detail, restriction = issue_details[issue_index % len(issue_details)]
        resolved = issue_day < TODAY - timedelta(days=21)
        rows["player_issues"].append(
            (
                stable_id(f"{year}:issue:{issue_index}"),
                TEAM_ID,
                player[0],
                linked_session,
                issue_type,
                severity,
                detail,
                restriction,
                MEDICAL_MEMBERSHIP_ID,
                "resolved" if resolved else "open",
                at(issue_day + timedelta(days=7), 18) if resolved else None,
            )
        )

    return rows


def sql_literal(value: Any) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (dict, list)):
        encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        return f"'{encoded.replace(chr(39), chr(39) * 2)}'::json"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (date, datetime, UUID)):
        value = value.isoformat() if not isinstance(value, UUID) else str(value)
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"


def chunked(rows: Sequence[Row], size: int = 250) -> Iterable[Sequence[Row]]:
    for index in range(0, len(rows), size):
        yield rows[index : index + size]


def render_insert(table: str, columns: Sequence[str], rows: Sequence[Row]) -> str:
    values = ",\n".join("(" + ",".join(sql_literal(value) for value in row) + ")" for row in rows)
    return f"INSERT INTO {table} ({','.join(columns)}) VALUES\n{values}\nON CONFLICT DO NOTHING;"


def render_sql(dataset: Dataset) -> str:
    statements = ["BEGIN;"]
    for table, columns in TABLE_COLUMNS.items():
        table_rows = dataset[table]
        for batch in chunked(table_rows):
            statements.append(render_insert(table, columns, batch))
    statements.append("COMMIT;")
    return "\n".join(statements) + "\n"


def render_table_batch(dataset: Dataset, table: str, batch_index: int, batch_size: int) -> str:
    batches = list(chunked(dataset[table], batch_size))
    if batch_index >= len(batches):
        return ""
    return render_insert(table, TABLE_COLUMNS[table], batches[batch_index]) + "\n"


def summary(dataset: Dataset) -> dict[str, int]:
    return {table: len(rows) for table, rows in dataset.items()}


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate one deterministic elite-team season")
    parser.add_argument("--year", type=int, default=2026)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--table", choices=TABLE_COLUMNS)
    parser.add_argument("--batch-index", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=100)
    args = parser.parse_args()
    dataset = build_dataset(args.year)
    rendered = (
        render_table_batch(dataset, args.table, args.batch_index, args.batch_size)
        if args.table
        else render_sql(dataset)
    )
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    else:
        print(rendered, end="")
    if not args.table:
        print(json.dumps(summary(dataset), ensure_ascii=False), file=sys.stderr)


if __name__ == "__main__":
    main()
