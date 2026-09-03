from datetime import date

from clubhaus.seed_year import TABLE_COLUMNS, build_dataset, render_table_batch, summary


def test_year_seed_has_realistic_deterministic_volume() -> None:
    dataset = build_dataset(2026)

    assert summary(dataset) == {
        "organizations": 1,
        "users": 29,
        "teams": 1,
        "team_memberships": 29,
        "player_readiness_entries": 24,
        "player_availability_decisions": 24,
        "injury_cases": 2,
        "player_health_changes": 50,
        "matches": 52,
        "microcycles": 52,
        "training_sessions": 260,
        "session_blocks": 624,
        "staff_reviews": 26,
        "player_goals": 48,
        "player_issues": 24,
        "performance_imports": 110,
        "performance_metrics": 2640,
        "publications": 450,
        "change_logs": 52,
    }
    assert min(row[3] for row in dataset["microcycles"]) == date(2026, 1, 5)
    assert max(row[3] for row in dataset["microcycles"]) == date(2026, 12, 28)
    assert dataset == build_dataset(2026)


def test_every_seed_row_matches_its_table_contract() -> None:
    dataset = build_dataset(2026)

    for table, rows in dataset.items():
        assert all(len(row) == len(TABLE_COLUMNS[table]) for row in rows)
        primary_keys = [row[0] for row in rows]
        assert len(primary_keys) == len(set(primary_keys))


def test_batch_sql_is_repeat_safe() -> None:
    sql = render_table_batch(build_dataset(2026), "training_sessions", 0, 25)

    assert sql.startswith("INSERT INTO training_sessions")
    assert sql.endswith("ON CONFLICT DO NOTHING;\n")
