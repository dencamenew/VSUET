from typing import List, Dict, Any
from sqlalchemy.orm import Session
import json
from VSUET.fastapi.app.models.pydantic_models.pydantic_models import TimetableDto, AttendanceReportDTO, StudentAttendanceDTO
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

    def generate_attendance_from_teacher_timetable(self, timetable: TimetableDto, teacher_name: str) -> None:
        """Generate attendance records from teacher timetable"""
        # This is a simplified implementation
        # In a real application, you would need to process the timetable
        # and create attendance records for each lesson
        
        # For now, we'll create a placeholder attendance record
        attendance_data = {
            "teacher_name": teacher_name,
            "period": "2024-1",
            "subject_type": "lecture",
            "subject_name": "Sample Subject",
            "group_name": "Sample Group",
            "day": "Monday",
            "time": "09:00",
            "report_json": {
                "students": [
                    {"student_id": "1", "attendance": "PRESENT"},
                    {"student_id": "2", "attendance": "ABSENT"}
                ]
            }
        }
        self.attendance_repository.create(attendance_data)

    def get_student_attendance_by_zach(self, zach_number: str) -> List[Dict[str, Any]]:
        """Get student attendance by zach number"""
        # This would need to be implemented based on how student data is stored
        # For now, returning empty list as placeholder
        return []

    def get_student_attendance_by_name(self, student_name: str) -> List[Dict[str, Any]]:
        """Get student attendance by name"""
        # This would need to be implemented based on how student data is stored
        # For now, returning empty list as placeholder
        return []

    def get_group_attendance(self, group_name: str, subject_name: str) -> List[Dict[str, Any]]:
        """Get group attendance for a specific subject"""
        attendances = self.attendance_repository.get_by_group_and_subject(group_name, subject_name)
        result = []
        for attendance in attendances:
            result.append({
                "id": attendance.id,
                "teacher_name": attendance.teacher_name,
                "period": attendance.period,
                "subject_type": attendance.subject_type,
                "subject_name": attendance.subject_name,
                "group_name": attendance.group_name,
                "day": attendance.day,
                "time": attendance.time,
                "report_json": attendance.report_json
            })
        return result

    def get_lesson_attendance(self, group_name: str, subject_name: str, day: str, time: str) -> List[Dict[str, Any]]:
        """Get attendance for a specific lesson"""
        attendances = self.attendance_repository.get_by_lesson(group_name, subject_name, day, time)
        result = []
        for attendance in attendances:
            result.append({
                "id": attendance.id,
                "teacher_name": attendance.teacher_name,
                "period": attendance.period,
                "subject_type": attendance.subject_type,
                "subject_name": attendance.subject_name,
                "group_name": attendance.group_name,
                "day": attendance.day,
                "time": attendance.time,
                "report_json": attendance.report_json
            })
        return result
