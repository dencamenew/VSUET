from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database settings
    database_url: str = "postgresql://admin:admin@localhost:5432/db"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8080
    
    # Security settings
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS settings
    allowed_origins: list[str] = ["*"]
    
    class Config:
        env_file = ".env"


settings = Settings()



