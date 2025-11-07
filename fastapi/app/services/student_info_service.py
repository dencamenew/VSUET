from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse
from app.models.enums import Role
from app.repositories.user_repository import UserRepository
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import create_access_token
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.groups_repository import GroupsRepository
from app.models.tables import TeacherInfo
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.repositories.teacher_timetable_repository import TeacherTimetableRepository
from app.repositories.group_timetable_repository import GroupTimetableRepository


class StudentInfoService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
        self.student_info_repository = StudentInfoRepository(db)
        self.group_repository = GroupsRepository(db)
        self.teacher_timetable_repository = TeacherTimetableRepository(db)
        self.group_timetable_repository = GroupTimetableRepository(db)
    
    def get_student_name_by_zach_number(self, zach_number: str):
        """
        Возвращает имя и фамилию студента по его зачетке.
        """
        result = self.student_info_repository.get_student_name_by_zach_number(zach_number)
        
        return result
            
            
