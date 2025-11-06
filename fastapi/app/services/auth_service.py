from typing import Dict, Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse
from app.models.enums import Role
from app.repositories.user_repository import UserRepository
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def login_by_max_id_token_only(self, max_id: str) -> Dict[str, str]:
        """
        Находит пользователя по max_id и возвращает только JWT токен.
        """
        
        # 1. Поиск пользователя по max_id
        user = self.user_repository.get_by_max_id(max_id) 
        if not user:
            raise InvalidCredentialsException(f"Пользователь с max_id '{max_id}' не найден")
        
        # 2. Генерация JWT токена
        access_token = create_access_token(
            user_id=user.id,
            username=user.max_id,
            role=user.role
        )

        # 3. Формирование конечного ответа
        response = {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
        return response