PYTHON := .venv/bin/python
PIP := .venv/bin/pip
FLUTTER := ./.toolchains/flutter/bin/flutter

.PHONY: help setup api-dev api-test api-lint api-openapi web-dev web-build web-lint mobile-get mobile-run mobile-test mobile-analyze db-up db-down db-migrate db-seed db-seed-year check

help:
	@echo "make setup          Install workspace dependencies"
	@echo "make api-dev        Run FastAPI on localhost:8000"
	@echo "make api-openapi    Export the shared OpenAPI contract"
	@echo "make web-dev        Run Next.js on localhost:3000"
	@echo "make mobile-run     Run the Flutter mobile app"
	@echo "make db-up          Start local PostgreSQL"
	@echo "make db-migrate     Apply database migrations"
	@echo "make db-seed        Load local elite-team preview data"
	@echo "make db-seed-year   Load a deterministic 2026 elite-team season"
	@echo "make check          Run all static checks and tests"

setup:
	$(PIP) install -e "./apps/api[dev]"
	npm install
	cd apps/mobile && ../../$(FLUTTER) pub get

api-dev:
	PYTHONPATH=apps/api/src $(PYTHON) -m uvicorn clubhaus.main:app --reload --host 0.0.0.0 --port 8000

api-test:
	PYTHONPATH=apps/api/src $(PYTHON) -m pytest apps/api/tests

api-lint:
	$(PYTHON) -m ruff check apps/api
	$(PYTHON) -m ruff format --check apps/api

api-openapi:
	PYTHONPATH=apps/api/src $(PYTHON) scripts/export_openapi.py

web-dev:
	npm run dev:web

web-build:
	npm run build:web

web-lint:
	npm run lint:web
	npm run typecheck:web

mobile-get:
	cd apps/mobile && ../../$(FLUTTER) pub get

mobile-run:
	cd apps/mobile && ../../$(FLUTTER) run

mobile-test:
	cd apps/mobile && ../../$(FLUTTER) test

mobile-analyze:
	cd apps/mobile && ../../$(FLUTTER) analyze

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-migrate:
	cd apps/api && ../../$(PYTHON) -m alembic -c alembic.ini upgrade head

db-seed:
	PYTHONPATH=apps/api/src $(PYTHON) -m clubhaus.seed

db-seed-year:
	PYTHONPATH=apps/api/src $(PYTHON) -m clubhaus.seed_year --year 2026 --output /tmp/base11-seed-year.sql
	docker cp /tmp/base11-seed-year.sql base11-postgres-1:/tmp/base11-seed-year.sql
	docker exec base11-postgres-1 psql -v ON_ERROR_STOP=1 -U clubhaus -d clubhaus -f /tmp/base11-seed-year.sql

check: api-lint api-test web-lint web-build mobile-analyze mobile-test
