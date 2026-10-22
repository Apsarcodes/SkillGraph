import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    APP_NAME: str = "SkillGraph AI"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillgraph.db")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skillgraph-jwt-secret-key-production-grade-2025")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # LLM & AI Mentor
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
    AI_FALLBACK_MODE: bool = os.getenv("AI_FALLBACK_MODE", "true").lower() == "true"
    
    # Privacy
    ENABLE_PII_REDACTION: bool = os.getenv("ENABLE_PII_REDACTION", "true").lower() == "true"
    LOG_RAW_RESUMES: bool = os.getenv("LOG_RAW_RESUMES", "false").lower() == "true"
    
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
