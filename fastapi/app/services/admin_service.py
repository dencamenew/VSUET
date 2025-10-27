from typing import Optional
from sqlalchemy.orm import Session
import json
from app.models.database import Faculty, Groups, StudentInfo, TeacherInfo, DeanInfo, User, GroupTimetable, TeacherTimetable
from app.models.enums import Role
from app.models.pydantic_models import TimetableDto
from app.repositories.faculty_repository import FacultyRepository
from app.repositories.groups_repository import GroupsRepository
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.repositories.dean_info_repository import DeanInfoRepository
from app.repositories.user_repository import UserRepository
from app.repositories.timetable_repository import TimetableRepository
from app.services.auth_service import AuthService


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.faculty_repository = FacultyRepository(db)
        self.groups_repository = GroupsRepository(db)
        self.student_info_repository = StudentInfoRepository(db)
        self.teacher_info_repository = TeacherInfoRepository(db)
        self.dean_info_repository = DeanInfoRepository(db)
        self.user_repository = UserRepository(db)
        self.timetable_repository = TimetableRepository(db)
        self.auth_service = AuthService(db)

    # =============== FACULTY ===============
    def create_faculty(self, faculty_name: str) -> Faculty:
        if self.faculty_repository.exists_by_name(faculty_name):
            raise ValueError("Факультет с таким названием уже существует.")

        faculty_data = {"name": faculty_name}
        return self.faculty_repository.create(faculty_data)

    def delete_faculty_by_id(self, faculty_id: int) -> None:
        faculty = self.faculty_repository.get(faculty_id)
        if not faculty:
            raise ValueError("Факультет с таким id не найден.")
        self.faculty_repository.delete(faculty_id)

    # =============== CREATE USERS ===============
    def create_dean_user(self, username: str, password: str, dean_name: str, faculty_id: int) -> User:
        if self.user_repository.exists_by_username(username):
            raise ValueError("Пользователь с таким username уже существует")

        faculty = self.faculty_repository.get(faculty_id)
        if not faculty:
            raise ValueError("Факультет не найден")

        # Create dean info
        dean_info_data = {
            "dean_name": dean_name,
            "faculty_id": faculty_id
        }
        dean_info = self.dean_info_repository.create(dean_info_data)

        # Create user
        user_data = {
            "username": username,
            "passwd": self.auth_service.get_password_hash(password),
            "role": Role.DEAN,
            "dean_info_id": dean_info.id
        }
        return self.user_repository.create(user_data)

    def create_student_user(self, username: str, password: str, student_name: str, group_id: int, zach_number: str) -> User:
        if self.user_repository.exists_by_username(username):
            raise ValueError("Пользователь с таким username уже существует")

        group = self.groups_repository.get(group_id)
        if not group:
            raise ValueError("Группа не найдена")

        # Create student info
        student_info_data = {
            "student_name": student_name,
            "zach_number": zach_number,
            "group_id": group_id
        }
        student_info = self.student_info_repository.create(student_info_data)

        # Create user
        user_data = {
            "username": username,
            "passwd": self.auth_service.get_password_hash(password),
            "role": Role.STUDENT,
            "student_info_id": student_info.id
        }
        return self.user_repository.create(user_data)

    def create_teacher_user(self, username: str, password: str, teacher_name: str) -> User:
        if self.user_repository.exists_by_username(username):
            raise ValueError("Пользователь с таким username уже существует")

        # Create teacher info
        teacher_info_data = {"teacher_name": teacher_name}
        teacher_info = self.teacher_info_repository.create(teacher_info_data)

        # Create user
        user_data = {
            "username": username,
            "passwd": self.auth_service.get_password_hash(password),
            "role": Role.TEACHER,
            "teacher_info_id": teacher_info.id
        }
        return self.user_repository.create(user_data)

    def create_admin_user(self, username: str, password: str) -> User:
        if self.user_repository.exists_by_username(username):
            raise ValueError("Пользователь с таким username уже существует")

        user_data = {
            "username": username,
            "passwd": self.auth_service.get_password_hash(password),
            "role": Role.ADMIN
        }
        return self.user_repository.create(user_data)

    # =============== DELETE USERS ===============
    def delete_dean_user(self, user_id: int) -> None:
        user = self.user_repository.get(user_id)
        if not user:
            raise ValueError("Пользователь не найден")

        if user.dean_info:
            self.dean_info_repository.delete(user.dean_info.id)
        self.user_repository.delete(user_id)

    def delete_student_user(self, user_id: int) -> None:
        user = self.user_repository.get(user_id)
        if not user:
            raise ValueError("Пользователь не найден")

        if user.student_info:
            self.student_info_repository.delete(user.student_info.id)
        self.user_repository.delete(user_id)

    def delete_teacher_user(self, user_id: int) -> None:
        user = self.user_repository.get(user_id)
        if not user:
            raise ValueError("Пользователь не найден")

        if user.teacher_info:
            self.teacher_info_repository.delete(user.teacher_info.id)
        self.user_repository.delete(user_id)

    def delete_admin_user(self, user_id: int) -> None:
        user = self.user_repository.get(user_id)
        if not user:
            raise ValueError("Пользователь не найден")

        if user.role != Role.ADMIN:
            raise ValueError("Пользователь не является администратором")

        self.user_repository.delete(user_id)

    # =============== TIMETABLES ===============
    def create_teacher_timetable(self, teacher_id: int, timetable_dto: TimetableDto) -> TeacherTimetable:
        teacher = self.teacher_info_repository.get(teacher_id)
        if not teacher:
            raise ValueError("Преподаватель не найден")

        timetable_json = json.dumps(timetable_dto.dict())
        timetable_data = {"timetable_json": timetable_json}
        timetable = self.timetable_repository.create_teacher_timetable(timetable_data)

        # Update teacher with timetable
        teacher.timetable_id = timetable.id
        self.db.commit()

        return timetable

    def create_student_timetable(self, group_id: int, timetable_dto: TimetableDto) -> GroupTimetable:
        group = self.groups_repository.get(group_id)
        if not group:
            raise ValueError("Группа не найдена")

        timetable_json = json.dumps(timetable_dto.dict())
        timetable_data = {"timetable_json": timetable_json}
        timetable = self.timetable_repository.create_group_timetable(timetable_data)

        # Update group with timetable
        group.timetable_id = timetable.id
        self.db.commit()

        return timetable

    def delete_teacher_timetable(self, teacher_id: int) -> None:
        teacher = self.teacher_info_repository.get(teacher_id)
        if not teacher:
            raise ValueError("Преподаватель не найден")

        if teacher.timetable:
            self.timetable_repository.delete_teacher_timetable(teacher.timetable.id)
            teacher.timetable_id = None
            self.db.commit()

    def delete_timetable_by_group_id(self, group_id: int) -> None:
        group = self.groups_repository.get(group_id)
        if not group:
            raise ValueError("Группа не найдена")

        if group.timetable:
            self.timetable_repository.delete_group_timetable(group.timetable.id)
            group.timetable_id = None
            self.db.commit()
