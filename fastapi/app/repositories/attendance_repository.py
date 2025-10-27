from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.database import Attendance
from .base_repository import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(Attendance, db)

    def get_by_teacher_name(self, teacher_name: str) -> List[Attendance]:
        return self.db.query(Attendance).filter(Attendance.teacher_name == teacher_name).all()

    def get_by_group_name(self, group_name: str) -> List[Attendance]:
        return self.db.query(Attendance).filter(Attendance.group_name == group_name).all()

    def get_by_student_zach(self, zach_number: str) -> List[Attendance]:
        # This would need to be implemented based on how student data is stored in report_json
        # For now, returning empty list as placeholder
        return []

    def get_by_student_name(self, student_name: str) -> List[Attendance]:
        # This would need to be implemented based on how student data is stored in report_json
        # For now, returning empty list as placeholder
        return []

    def get_by_group_and_subject(self, group_name: str, subject_name: str) -> List[Attendance]:
        return (
            self.db.query(Attendance)
            .filter(
                Attendance.group_name == group_name,
                Attendance.subject_name == subject_name
            )
            .all()
        )

    def get_by_lesson(self, group_name: str, subject_name: str, day: str, time: str) -> List[Attendance]:
        return (
            self.db.query(Attendance)
            .filter(
                Attendance.group_name == group_name,
                Attendance.subject_name == subject_name,
                Attendance.day == day,
                Attendance.time == time
            )
            .all()
        )



