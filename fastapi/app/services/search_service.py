from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.repositories.groups_repository import GroupsRepository


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.student_info_repository = StudentInfoRepository(db)
        self.teacher_info_repository = TeacherInfoRepository(db)
        self.groups_repository = GroupsRepository(db)

    def search_students_by_name(self, name: str) -> List[Dict[str, Any]]:
        """Search students by name"""
        students = self.student_info_repository.get_by_student_name(name)
        if not students:
            return []
        
        return [{
            "id": students.id,
            "student_name": students.student_name,
            "zach_number": students.zach_number,
            "group_name": students.group.group_name if students.group else None
        }]

    def search_teachers_by_name(self, name: str) -> List[Dict[str, Any]]:
        """Search teachers by name"""
        teachers = self.teacher_info_repository.get_by_teacher_name(name)
        if not teachers:
            return []
        
        return [{
            "id": teachers.id,
            "teacher_name": teachers.teacher_name
        }]

    def search_groups_by_name(self, name: str) -> List[Dict[str, Any]]:
        """Search groups by name"""
        groups = self.groups_repository.get_by_group_name(name)
        if not groups:
            return []
        
        return [{
            "id": groups.id,
            "group_name": groups.group_name,
            "faculty_name": groups.faculty.name if groups.faculty else None
        }]
