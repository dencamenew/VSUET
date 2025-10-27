from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.repositories.groups_repository import GroupsRepository
from app.repositories.faculty_repository import FacultyRepository


class InfoService:
    def __init__(self, db: Session):
        self.db = db
        self.student_info_repository = StudentInfoRepository(db)
        self.teacher_info_repository = TeacherInfoRepository(db)
        self.groups_repository = GroupsRepository(db)
        self.faculty_repository = FacultyRepository(db)

    def get_student_info(self, student_id: int) -> Optional[Dict[str, Any]]:
        """Get student information by ID"""
        student = self.student_info_repository.get(student_id)
        if not student:
            return None
        
        return {
            "id": student.id,
            "student_name": student.student_name,
            "zach_number": student.zach_number,
            "group_name": student.group.group_name if student.group else None,
            "faculty_name": student.group.faculty.name if student.group and student.group.faculty else None
        }

    def get_teacher_info(self, teacher_id: int) -> Optional[Dict[str, Any]]:
        """Get teacher information by ID"""
        teacher = self.teacher_info_repository.get(teacher_id)
        if not teacher:
            return None
        
        return {
            "id": teacher.id,
            "teacher_name": teacher.teacher_name
        }

    def get_group_info(self, group_id: int) -> Optional[Dict[str, Any]]:
        """Get group information by ID"""
        group = self.groups_repository.get(group_id)
        if not group:
            return None
        
        return {
            "id": group.id,
            "group_name": group.group_name,
            "faculty_name": group.faculty.name if group.faculty else None
        }

    def get_faculty_info(self, faculty_id: int) -> Optional[Dict[str, Any]]:
        """Get faculty information by ID"""
        faculty = self.faculty_repository.get(faculty_id)
        if not faculty:
            return None
        
        return {
            "id": faculty.id,
            "name": faculty.name
        }

    def get_all_faculties(self) -> List[Dict[str, Any]]:
        """Get all faculties"""
        faculties = self.faculty_repository.get_multi()
        return [{
            "id": faculty.id,
            "name": faculty.name
        } for faculty in faculties]

    def get_all_groups(self) -> List[Dict[str, Any]]:
        """Get all groups"""
        groups = self.groups_repository.get_multi()
        return [{
            "id": group.id,
            "group_name": group.group_name,
            "faculty_name": group.faculty.name if group.faculty else None
        } for group in groups]
