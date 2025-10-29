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

    def get_student_attendance(self, group_name: str, zach_number: str) -> Dict:
        """
        Возвращает ведомости посещаемости студента по группе и номеру зачетки.
        """
        result = self.attendance_repository.get_student_attendance(group_name, zach_number)
        if "error" in result:
            # Можно бросить исключение или вернуть результат как есть
            return {"status": "error", "detail": result["error"]}
        return {"status": "success", "data": result}
