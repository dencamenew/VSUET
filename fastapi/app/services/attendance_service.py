from typing import List, Dict, Any
from sqlalchemy.orm import Session
import json
from app.models.pydantic_models.pydantic_models import TimetableDto, AttendanceReportDTO, StudentAttendanceDTO
from app.models.enums import AttendanceStatus
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.repositories.student_info_repository import StudentInfoRepository


class AttendanceService:
    def __init__(self, db: Session):
        self.db = db
        self.attendance_repository = AttendanceRepository(db)
        self.teacher_info_repository = TeacherInfoRepository(db)
        self.student_info_repository = StudentInfoRepository(db)
    
    def get_teacher_attendance(self, first_name: str, last_name: str, subject_name: str):
        result = self.attendance_repository.get_ved_for_teacher(first_name, last_name, subject_name)
        return result
    
    def get_student_attendance(self, group_name: str, zach_number: str) -> Dict:
        """
        Возвращает ведомости посещаемости студента по группе и номеру зачетки.
        """
        result = self.attendance_repository.get_student_attendance(group_name, zach_number)
        if "error" in result:
            # Можно бросить исключение или вернуть результат как есть
            return {"status": "error", "detail": result["error"]}
        return {"status": "success", "data": result}
    

    def mark_to_one(self, teacher_first_name: str, teacher_last_name: str, group_name: str, subject_name: str, date: str, zach: str, status: bool):
        result = self.attendance_repository.mark_attendance_to_one(
            teacher_first_name=teacher_first_name,
            teacher_last_name=teacher_last_name,
            subject_name=subject_name,
            date_str=date,
            zach=zach,
            group_name=group_name,
            status=status
        )

        if "error" in result:
            return {"status": "error", "detail": result["error"]}

        return {"status": "success", "message": result["message"]}
    
    def mark_to_many(self, teacher_first_name: str, teacher_last_name: str, group_name: str, subject_name: str, date: str, zach_list: List[str]):
        result = self.attendance_repository.mark_attendance_to_many(
            teacher_first_name=teacher_first_name,
            teacher_last_name=teacher_last_name,
            subject_name=subject_name,
            date_str=date,
            zach_list=zach_list,
            group_name=group_name
        )

        if "error" in result:
            return {"status": "error", "detail": result["error"]}

        return {"status": "success", "message": result["message"]}