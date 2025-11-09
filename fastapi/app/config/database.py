from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings
import redis.asyncio as aioredis
from fastapi import Depends
import asyncio
import redis.asyncio as aioredis
from app.config.settings import settings
from app.services.qr_service import QRService


# Create database engine
engine = create_engine(settings.database_url)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Функция для создания сессии DB внутри init_redis
def get_db_sync():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




# Настройки Redis для сессий QR 
redis_client: aioredis.Redis | None = None
qr_service: QRService | None = None
_token_update_task: asyncio.Task | None = None


async def init_redis():
    """Создание и подключение клиента Redis и запуск фоновой задачи"""
    global redis_client, qr_service, _token_update_task
    if redis_client is None:
        redis_client = await aioredis.from_url(
            f"redis://{settings.redis_host}:{settings.redis_port}/{settings.redis_db}",
            password=settings.redis_password,
            decode_responses=True,
        )
    
    if qr_service is None:
        db = next(get_db_sync())
        qr_service = QRService(redis_client, db)
    
    # запуск фоновой задачи, если она ещё не запущена
    if _token_update_task is None:
        _token_update_task = asyncio.create_task(qr_service.update_tokens_loop(interval=1000)) #вот тут ставится интервал
    
    return redis_client


async def get_redis() -> aioredis.Redis:
    if redis_client is None:
        await init_redis()
    return redis_client


async def close_redis():
    """Закрытие соединения Redis"""
    global redis_client, qr_service, _token_update_task
    if _token_update_task:
        _token_update_task.cancel()
        _token_update_task = None
    if redis_client:
        await redis_client.close()
        redis_client = None
        qr_service = None