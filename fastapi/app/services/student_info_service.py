from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.tables import StudentInfo, User, Attendance
from app.repositories.user_repository import UserRepository
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.groups_repository import GroupsRepository
from app.repositories.teacher_timetable_repository import TeacherTimetableRepository
from app.repositories.group_timetable_repository import GroupTimetableRepository
from app.repositories.attendance_repository import AttendanceRepository


class StudentInfoService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
        self.student_info_repository = StudentInfoRepository(db)
        self.group_repository = GroupsRepository(db)
        self.teacher_timetable_repository = TeacherTimetableRepository(db)
        self.group_timetable_repository = GroupTimetableRepository(db)
        self.attendance_repository = AttendanceRepository(db)

    def get_student_name_by_zach_number(self, zach_number: str) -> Optional[Dict[str, str]]:
        """
        Возвращает имя и фамилию студента по его зачетке.
        """
        result = self.student_info_repository.get_student_name_by_zach_number(zach_number)
        return result

    def get_subjects_by_zach_number(self, zach_number: str) -> Dict[str, List[Dict[str, str]]]:
        """
        Возвращает список предметов студента по номеру зачетки.
        Формат: {"zach_number": [{"subject_name": ..., "subject_type": ...}, ...]}
        """
        student = self.student_info_repository.get_by_zach_number(zach_number)
        if not student:
            return {}

        # Получаем все ведомости группы студента
        attendances = self.attendance_repository.db.query(self.attendance_repository.model)\
            .filter(self.attendance_repository.model.group_id == student.group_id)\
            .all()

        subjects = []
        for attendance in attendances:
            if any(record["student_id"] == zach_number for record in (attendance.attendance_json or [])):
                subjects.append({
                    "subject_name": attendance.subject_name,
                    "subject_type": attendance.subject_type
                })

        return {zach_number: subjects}
