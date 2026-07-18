from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from clubhaus.core.config import settings
from clubhaus.modules.health.api.router import router as health_router
from clubhaus.modules.teams.api.router import router as teams_router


def create_app() -> FastAPI:
    application = FastAPI(
        title="Clubhaus API",
        version="0.1.0",
        docs_url="/docs" if settings.environment != "prod" else None,
        redoc_url=None,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(health_router)
    application.include_router(teams_router, prefix="/api/v1")
    return application


app = create_app()
