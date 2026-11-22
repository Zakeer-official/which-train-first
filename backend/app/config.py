from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Which Train First"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./train_race.db"
    
    # Redis Cache (Optional)
    REDIS_URL: str = ""
    CACHE_TTL_SECONDS: int = 60
    
    # Railway Data Provider
    # Options: "demo", "rapidapi", "railradar"
    RAILWAY_API_PROVIDER: str = "demo"
    RAPIDAPI_KEY: str = ""
    RAPIDAPI_HOST: str = "irctc1.p.rapidapi.com"
    RAILRADAR_API_KEY: str = ""
    
    # Race Polling / Refresh
    REFRESH_INTERVAL_SECONDS: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://which-train-first.vercel.app"
    ]
    
    # Sharing
    BASE_URL: str = "http://localhost:3000"

settings = Settings()
