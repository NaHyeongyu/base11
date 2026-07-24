import ast
from pathlib import Path

API_ROOT = Path(__file__).parents[1] / "src" / "clubhaus"


def imported_modules(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    modules: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            modules.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            modules.add(node.module)
    return modules


def test_teams_router_depends_on_application_not_storage_or_coaching() -> None:
    imports = imported_modules(API_ROOT / "modules" / "teams" / "api" / "router.py")

    assert not any(name.startswith("sqlalchemy") for name in imports)
    assert not any(name.startswith("clubhaus.modules.coaching") for name in imports)
    assert "clubhaus.modules.teams.api.dependencies" in imports


def test_team_domain_is_framework_free() -> None:
    domain = API_ROOT / "modules" / "teams" / "domain"
    imports = set().union(*(imported_modules(path) for path in domain.glob("*.py")))

    forbidden_roots = {"fastapi", "sqlalchemy", "pydantic", "boto3"}
    assert not {name.split(".", 1)[0] for name in imports} & forbidden_roots


def test_coaching_router_only_composes_feature_routers() -> None:
    router_path = API_ROOT / "modules" / "coaching" / "api" / "router.py"
    imports = imported_modules(router_path)

    assert len(router_path.read_text(encoding="utf-8").splitlines()) <= 25
    assert imports - {"fastapi"} == {
        "clubhaus.modules.coaching.api.dashboard",
        "clubhaus.modules.coaching.api.performance",
        "clubhaus.modules.coaching.api.planning",
        "clubhaus.modules.coaching.api.player_development",
        "clubhaus.modules.coaching.api.publications",
        "clubhaus.modules.coaching.api.staff_reviews",
    }


def test_coaching_application_is_framework_free() -> None:
    application = API_ROOT / "modules" / "coaching" / "application"
    imports = set().union(*(imported_modules(path) for path in application.glob("*.py")))

    forbidden_roots = {"fastapi", "sqlalchemy", "pydantic", "boto3"}
    assert not {name.split(".", 1)[0] for name in imports} & forbidden_roots


def test_coaching_runtime_uses_feature_models_and_contracts() -> None:
    coaching = API_ROOT / "modules" / "coaching"
    runtime_files = [
        *coaching.joinpath("api").glob("*.py"),
        *coaching.joinpath("infrastructure").glob("*.py"),
    ]
    imports = set().union(*(imported_modules(path) for path in runtime_files))

    assert "clubhaus.modules.coaching.models" not in imports
    assert "clubhaus.modules.coaching.schemas" not in imports
