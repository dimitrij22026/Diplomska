from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the backend directory (where .env is located)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application configuration loaded from environment variables/.env file."""

    PROJECT_NAME: str = "AI-Powered Personal Finance Advisor"
    API_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]

    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    OPENAI_API_KEY: str | None = None
    GOOGLE_GEMINI_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None
    AI_ASSISTANT_NAME: str = "FinMate"

    # Email settings
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "FinMate"
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    FRONTEND_URL: str = "http://localhost:5173"

    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "finance_app"
    MYSQL_PASSWORD: str = "change-me"
    MYSQL_DB: str = "finance_app"

    SQLALCHEMY_DATABASE_URI: str | None = "sqlite:///./finance_app.db"

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"), env_file_encoding="utf-8", extra="ignore")

    def db_uri(self) -> str:
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    print(f"=== SETTINGS LOADED ===")
    print(f"ENV file path: {BACKEND_DIR / '.env'}")
    print(
        f"Gemini API Key: {'SET (' + s.GOOGLE_GEMINI_API_KEY[:10] + '...)' if s.GOOGLE_GEMINI_API_KEY else 'NOT SET'}")
    print(f"========================")
    return s


settings = get_settings()
