from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse
from app.models.enums import Role
from app.repositories.user_repository import UserRepository
from app.dto.exceptions import InvalidCredentialsException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def login(self, request: LoginRequest) -> LoginResponse:
        # Find user by username
        user = self.user_repository.get_by_username_with_relations(request.username)
        if not user:
            raise InvalidCredentialsException("Пользователь не найден")

        # Verify password
        if not self.verify_password(request.password, user.passwd):
            raise InvalidCredentialsException("Неверный пароль")

        # Return different data based on role
        if user.role == Role.STUDENT:
            if not user.student_info:
                raise InvalidCredentialsException("Информация о студенте отсутствует")

            student_info = user.student_info
            group_name = student_info.group.group_name if student_info.group else None
            faculty_name = (
                student_info.group.faculty.name
                if student_info.group and student_info.group.faculty
                else None
            )

            return LoginResponse(
                username=user.username,
                role=user.role.value,
                name=student_info.student_name,
                group_name=group_name,
                faculty_name=faculty_name
            )

        elif user.role == Role.TEACHER:
            if not user.teacher_info:
                raise InvalidCredentialsException("Информация о преподавателе отсутствует")

            teacher_info = user.teacher_info
            return LoginResponse(
                username=user.username,
                role=user.role.value,
                name=teacher_info.teacher_name,
                group_name=None,
                faculty_name=None
            )

        elif user.role == Role.DEAN:
            if not user.dean_info:
                raise InvalidCredentialsException("Информация о декане отсутствует")

            dean_info = user.dean_info
            faculty_name = dean_info.faculty.name if dean_info.faculty else None

            return LoginResponse(
                username=user.username,
                role=user.role.value,
                name=dean_info.dean_name,
                group_name=None,
                faculty_name=faculty_name
            )

        else:
            raise InvalidCredentialsException(f"Неизвестная роль пользователя: {user.role}")
