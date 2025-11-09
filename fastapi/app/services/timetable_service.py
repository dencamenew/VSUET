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


class TimetableService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
        self.student_info_repository = StudentInfoRepository(db)
        self.group_repository = GroupsRepository(db)
        self.teacher_timetable_repository = TeacherTimetableRepository(db)
        self.group_timetable_repository = GroupTimetableRepository(db)
    
    def get_my_timetable_by_max_id(self, max_id: str):
        user = self.user_repository.get_by_max_id(max_id)

        if user.role == "student":
            timetable = {}
            student_info_id = user.student_info_id
            group_id = self.student_info_repository.get_by_id(student_info_id).group_id
            timetable = self.group_timetable_repository.get_by_group_id(group_id).timetable


        elif user.role == "teacher":
            teacher_info_id = user.teacher_info_id
            timetable = self.teacher_timetable_repository.get_by_teacher_info_id(teacher_info_id).timetable
    
        return timetable
            
            
