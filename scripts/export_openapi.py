import json
from pathlib import Path

from clubhaus.main import app


def main() -> None:
    output = Path("packages/api-contract/openapi.json")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(app.openapi(), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Exported {output}")


if __name__ == "__main__":
    main()
