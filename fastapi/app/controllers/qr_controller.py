from fastapi import APIRouter, Depends, HTTPException, status
from redis import Redis
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.config.database import get_db, get_redis
from app.services.qr_service import QRService
from app.utils.jwt import get_current_user_id




qr_router = APIRouter(prefix="/api/qr", tags=["qr"])




@qr_router.post(
    "/generate-session", 
    summary="Эндпоинт для создания сессии для QR-кода в Redis.",
    status_code=status.HTTP_201_CREATED
)
async def generate_qr_session(
    group_name: str,
    subject_name: str,
    subject_type: str,
    date: str,
    lesson_start_time: str,
    db: Session = Depends(get_db),
    max_id: str = Depends(get_current_user_id),
    redis: Redis = Depends(get_redis)
):
    qr_service = QRService(redis, db)
    session_info = await qr_service.generate_qr_session(
        group_name=group_name,
        subject_name=subject_name,
        subject_type=subject_type,
        date=date,
        lesson_start_time=lesson_start_time
    )

    return session_info


@qr_router.post(
    "/close-session",
    summary="Закрытие сессии QR",
    status_code=status.HTTP_200_OK
)
async def close_qr_session(
    session_id: str,
    db: Session = Depends(get_db),
    max_id: str = Depends(get_current_user_id),
    redis: Redis = Depends(get_redis)
):
    qr_service = QRService(redis, db)
    if qr_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Сервис QR не инициализирован"
        )
    
    result = await qr_service.close_qr_session(max_id, session_id)

    if "error" in result:
        # Проверяем, является ли ошибка повторной попыткой закрытия
        if "уже закрыта" in result["error"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, # Плохой запрос / Невозможное действие
                detail=result["error"]
            )
        
        # Если сессия не найдена
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"]
        )

    return result

@qr_router.post(
    "/scan-qr",
    summary="Проверка QR-кода: session_id + токен",
)
async def scan_qr(
    session_id: str,
    token: str,
    db: Session = Depends(get_db),
    max_id: str = Depends(get_current_user_id),
    redis: Redis = Depends(get_redis)
):
    qr_service = QRService(redis, db)
    if qr_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Сервис QR не инициализирован"
        )

    result = await qr_service.scan_qr(max_id, session_id, token)

    if "error" in result:
        raise HTTPException(
            status_code=result.get("status_code", status.HTTP_400_BAD_REQUEST),
            detail=result["error"]
        )

    return {
        "message": result["message"],
        "session_id": result["session_id"],
        "token": result["token"]
    }


@qr_router.get("/session-students", summary="Список студентов отметившихся с помощью QR")
async def get_session_students(
    session_id: str,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    qr_service = QRService(redis, db)

    result = await qr_service.get_session_students(session_id)

    if "error" in result:
        raise HTTPException(status_code=result.get("status_code", 404), detail=result["error"])

    return result






