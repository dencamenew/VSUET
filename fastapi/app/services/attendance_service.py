from typing import List, Dict, Any
from sqlalchemy.orm import Session
import json
from app.models.pydantic_models.pydantic_models import TimetableDto, AttendanceReportDTO, StudentAttendanceDTO
from app.models.enums import AttendanceStatus
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.user_repository import UserRepository
from app.repositories.groups_repository import GroupsRepository


class AttendanceService:
    def __init__(self, db: Session):
        self.db = db
        self.attendance_repository = AttendanceRepository(db)
        self.teacher_info_repository = TeacherInfoRepository(db)
        self.student_info_repository = StudentInfoRepository(db)
        self.user_repository = UserRepository(db)
        self.group_repository = GroupsRepository(db)
    

    def get_teacher_attendance(self, max_id: str, group_name: str, subject_type: str, subject_name: str):
        """
        Возвращает ведомости посещаемости студента по группе и номеру зачетки.
        """
        teacher_info_id = self.user_repository.get_by_max_id_teacher_info_id(max_id)[0] # почему-то возвращает кортеж поэтому [0]
        group_id = self.group_repository.get_by_group_name(group_name).id
        result = self.attendance_repository.get_ved_for_teacher(group_id, teacher_info_id, subject_name, subject_type)
        return result
    



    def get_student_attendance(self, max_id: str, subject_name: str, subject_type: str) -> Dict:
        """
        Возвращает ведомости посещаемости студента по группе и номеру зачетки.
        """
        student_info_id = self.user_repository.get_by_max_id_student_info_id(max_id=max_id)[0] #почему-то кортеж возвращает поэтому [0]
        zach = self.student_info_repository.get_by_id(student_id=student_info_id).zach_number 
        group_id = self.student_info_repository.get_by_id(student_id=student_info_id).group_id
        result = self.attendance_repository.get_student_attendance(group_id=group_id, zach_number=zach, subject_name=subject_name, subject_type=subject_type)
        if "error" in result:
            # Можно бросить исключение или вернуть результат как есть
            return {"status": "error", "detail": result["error"]}
        return {"status": "success", "data": result}
    



    def mark_to_one(self, max_id: str, group_name: str, subject_name: str, subject_type: str, date: str, zach: str, status: bool):
        teacher_info_id = self.user_repository.get_by_max_id_teacher_info_id(max_id)[0] # почему-то возвращает кортеж поэтому [0]
        group_id = self.group_repository.get_by_group_name(group_name).id

        result = self.attendance_repository.mark_attendance_to_one(
            teacher_info_id=teacher_info_id,
            subject_name=subject_name,
            subject_type=subject_type,
            date_str=date,
            zach=zach,
            group_id=group_id,
            status=status
        )

        if "error" in result:
            return {"status": "error", "detail": result["error"]}

        return {"status": "success", "message": result["message"]}
    



    def mark_to_many(self, teacher_first_name: str, teacher_last_name: str, group_name: str, subject_name: str, subject_type: str, date: str, zach_list: List[str]):
        result = self.attendance_repository.mark_attendance_to_many(
            teacher_first_name=teacher_first_name,
            teacher_last_name=teacher_last_name,
            subject_name=subject_name,
            date_str=date,
            zach_list=zach_list,
            group_name=group_name,
            subject_type=subject_type
        )

        if "error" in result:
            return {"status": "error", "detail": result["error"]}

        return {"status": "success", "message": result["message"]}