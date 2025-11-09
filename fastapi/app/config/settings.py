from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database settings
    database_url: str = "postgresql://admin:admin@localhost:5432/db"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8080
    
    


settings = Settings()



