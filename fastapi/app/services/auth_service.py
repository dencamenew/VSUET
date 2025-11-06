from typing import Any, Dict, Optional
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
            max_id=user.max_id
        )

        # 3. Формирование конечного ответа
        response = {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
        return response

    def get_user_me_info(self, max_id: str) -> Dict[str, Any]:
        """Собирает всю информацию о пользователе по его max_id."""
        
        # 1. Загрузка пользователя с отношениями
        user = self.user_repository.get_by_max_id_with_relations(max_id)
        if not user:
            # Этот случай может произойти, если пользователь удален после выдачи токена
            raise EntityNotFoundException(f"Пользователь с max_id {max_id} не найден.")

        # 2. Сбор базовой информации
        user_info = {
            "id": user.id,
            "max_id": user.max_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role, # Передаем строковое значение роли
            "details": {} 
        }
        print("++++++")

        # 3. Сбор специфичной информации по ролям
        if user.role == Role.STUDENT and user.student_info:
            student_info = user.student_info
            
            # Извлекаем имя группы из загруженного отношения
            group_name = student_info.group.group_name if student_info.group else None
            
            user_info["details"].update({
                "zach_number": getattr(student_info, 'zach_number', None),
                "group_name": group_name,
            })

        elif user.role == Role.TEACHER and user.teacher_info:
            teacher_info = user.teacher_info
            user_info["details"].update({
                "position": getattr(teacher_info, 'position', None), 
            })

        
            
        return user_info