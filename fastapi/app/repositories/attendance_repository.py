from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.tables import Attendance, Groups
from .base_repository import BaseRepository
from app.dto.attendance_ved_dto import AttendanceDTO


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(Attendance, db)


    def get_student_attendance(self, group_name: str, zach_number: str) -> Dict:
        """Возвращает все ведомости посещаемости студента по номеру зачетки и названию группы."""
        
        # Получаем группу по имени
        group = self.db.query(Groups).filter(Groups.group_name == group_name).first()
        if not group:
            return {"error": f"Группа '{group_name}' не найдена"}

        # Получаем все ведомости для группы
        attendances = self.db.query(Attendance).filter(Attendance.group_id == group.id).all()

        student_attendance_by_subject = []

        for attendance_record in attendances:
            subject_name = attendance_record.subject_name
            attendance_list = attendance_record.attendance_json  # список AttendanceDTO

            for entry in attendance_list:
                if entry["student_id"] == zach_number:
                    student_attendance_by_subject.append({
                        "subject": subject_name,
                        "attendance": entry["attendance"]
                    })
                    break

        return {
            "zach_number": zach_number,
            "group": group_name,
            "subjects": student_attendance_by_subject
        }             