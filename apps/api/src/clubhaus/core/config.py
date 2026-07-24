from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = Field(default="local", alias="APP_ENV")
    database_url: str = Field(
        default="postgresql+psycopg://clubhaus:clubhaus@localhost:55432/clubhaus",
        alias="DATABASE_URL",
    )
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="API_CORS_ORIGINS")
    auth_mode: str = Field(default="local", alias="AUTH_MODE")
    local_user_id: str = Field(
        default="22222222-2222-4222-8222-222222222222",
        alias="LOCAL_USER_ID",
    )
    cognito_region: str = Field(default="ap-northeast-2", alias="COGNITO_REGION")
    cognito_user_pool_id: str = Field(default="", alias="COGNITO_USER_POOL_ID")
    cognito_app_client_id: str = Field(default="", alias="COGNITO_APP_CLIENT_ID")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
