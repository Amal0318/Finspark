import os
from typing import List, Union
from pydantic import AnyHttpUrl, BeforeValidator, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated


def parse_cors(v: Union[str, List[str]]) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CyberSense"
    ENVIRONMENT: str = "development"

    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str

    BACKEND_CORS_ORIGINS: Annotated[
        List[str], BeforeValidator(parse_cors)
    ] = ["http://localhost", "http://localhost:5173", "http://localhost:3000"]

    FIRST_SUPERUSER_EMAIL: str = "admin@cybersense.ai"
    FIRST_SUPERUSER_PASSWORD: str = "CyberSenseAdminSecurePass2026!"

    ML_SERVICE_URL: str = "http://ml:8080"


settings = Settings()
