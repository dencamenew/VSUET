# app/services/rating_service.py
import asyncio
import json
from typing import Dict, Any
from uuid import uuid4
from redis.asyncio import Redis
from fastapi import status
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository


class QRService:
    def __init__(self, redis: Redis, db: Session):
        self.redis = redis
        self._token_update_task: asyncio.Task | None = None
        self.db = db
        self.user_repository = UserRepository(db)


    async def generate_qr_session(
        self,
        group_name: str,
        subject_name: str,
        subject_type: str,
        date: str,
        lesson_start_time: str,
    ) -> Dict[str, Any]:
        """Генерация сессии для QR в Redis с первым токеном."""
        session_id = str(uuid4())
        session_key = f"session:{session_id}"

        first_token = uuid4().hex

        await self.redis.hset(session_key, mapping={
            "subject_name": subject_name,
            "subject_type": subject_type,
            "group_name": group_name,
            "date": date,
            "lesson_start_time": lesson_start_time,
            "students": json.dumps([]),
            "current_token": first_token,
            "active_status": 1
        })

        return {
            "message": "Сессия посещаемости успешно создана",
            "session_id": session_id,
            "group_name": group_name,
            "subject_name": subject_name,
            "subject_type": subject_type,
            "date": date,
            "lesson_start_time": lesson_start_time,
            "current_token": first_token,
            "active_status": 1
        }


    async def close_qr_session(self, session_id: str) -> Dict[str, Any]:
        """Закрытие сессии: выставление active_status = 0"""
        session_key = f"session:{session_id}"

        exists = await self.redis.exists(session_key)
        if not exists:
            return {"error": "Сессия не найдена"}

        await self.redis.hset(session_key, "active_status", 0)
        return {"message": f"Сессия {session_id} успешно закрыта", "session_id": session_id}


    async def scan_qr(self, max_id: str, session_id: str, token: str) -> Dict[str, Any]:
        """Проверка QR-кода: session_id + token"""
        session_key = f"session:{session_id}"

        exists = await self.redis.exists(session_key)
        if not exists:
            return {"error": "Сессия не найдена", "status_code": status.HTTP_404_NOT_FOUND}

        active = await self.redis.hget(session_key, "active_status")
        if not active or int(active) == 0:
            return {"error": "Сессия закрыта", "status_code": status.HTTP_400_BAD_REQUEST}

        current_token = await self.redis.hget(session_key, "current_token")
        if token != current_token:
            return {"error": "Неверный токен", "status_code": status.HTTP_403_FORBIDDEN}
        
        # Получаем текущий список студентов
        students_json = await self.redis.hget(session_key, "students")
        students = json.loads(students_json) if students_json else []
        

        # Добавляем студента, если его там ещё нет
        student_id = await asyncio.to_thread(self.user_repository.get_student_zach_number_by_max_id, max_id)
        if student_id not in students:
            students.append(student_id)
            await self.redis.hset(session_key, "students", json.dumps(students))

        # Если всё верно
        return {
            "message": "QR-код успешно проверен",
            "session_id": session_id,
            "token": token,
            "status_code": status.HTTP_200_OK
        }


    
    # фоновые задачи для Redis потом перенести в config/datebase.py
    async def update_tokens_loop(self, interval: int = 10):
        """Фоновая задача: обновление токенов всех активных сессий и публикация в канал Redis"""
        while True:
            keys = await self.redis.keys("session:*")
            for key in keys:
                active = await self.redis.hget(key, "active_status")
                if active and int(active):
                    new_token = uuid4().hex
                    await self.redis.hset(key, "current_token", new_token)
                    
                    # публикуем токен в канал Redis для WebSocket
                    await self.redis.publish(f"token_updates:{key}", new_token)
            await asyncio.sleep(interval)


    def start_token_updater(self, interval: int = 10):
        """Запуск фонового обновления токенов при старте приложения."""
        if not self._token_update_task:
            self._token_update_task = asyncio.create_task(self.update_tokens_loop(interval))
