from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # psql settings
    database_url: str = "postgresql://admin:admin@localhost:5432/db"
    

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8080


    #redis settings
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str | None = None
    
    


settings = Settings()



