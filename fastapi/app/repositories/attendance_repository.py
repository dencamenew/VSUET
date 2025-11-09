from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.tables import Attendance, Groups, TeacherInfo, User
from .base_repository import BaseRepository
from app.dto.attendance_ved_dto import AttendanceDTO
from sqlalchemy.orm.attributes import flag_modified



class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(Attendance, db)


    def get_student_attendance(self, group_id: int, zach_number: str, subject_type: str, subject_name: str) -> Dict:
        """Возвращает все ведомости посещаемости студента по номеру зачетки и названию группы."""
        

        attendances = (
            self.db.query(Attendance)
                .filter(
                    Attendance.group_id == group_id,
                    Attendance.subject_name == subject_name,
                    Attendance.subject_type == subject_type
                ).first().attendance_json
            )
        
        student_attendance = {}

        for attendance_record in attendances:
            if attendance_record["student_id"] == zach_number:
                student_attendance = attendance_record
                break

        return {
            "subject_name": subject_name,
            "subject_type": subject_type,
            "attendance": student_attendance
        }




    def get_ved_for_teacher(self, group_id: int, teacher_id: int, subject_name: str, subject_type: str):
        """
        Возвращает ведомость, которую должен заполнять конкретный учитель,
        по названию группы, названию предмета, типу предмета и teacher_info_id.
        """
        ved = (
            self.db.query(Attendance)
               .filter(
                   Attendance.group_id == group_id,
                   Attendance.teacher_id == teacher_id,
                   Attendance.subject_name == subject_name,
                   Attendance.subject_type == subject_type
               ).first()
            )
        
        return ved




    """меняет статус по зачетке для одного студента."""
    def mark_attendance_to_one(
        self,
        teacher_info_id: int,
        group_id: int,
        subject_name: str,
        subject_type: str,
        date_str: str,
        zach: str,
        status: bool
    ) -> dict:
        # 3. Ищем ведомость
        attendance_record = (
            self.db.query(Attendance)
            .filter(
                Attendance.teacher_id == teacher_info_id,
                Attendance.group_id == group_id,
                Attendance.subject_name == subject_name,
                Attendance.subject_type == subject_type
            )
            .first()
        )

        
        # 4. Загружаем существующую посещаемость
        attendance_data = attendance_record.attendance_json or []

        # 5. Обновляем или добавляем студента
        for std_attendance in attendance_data:
            if std_attendance["student_id"] == zach:
                std_attendance["attendance"][date_str] = status
                break
        else:
            attendance_data.append({"student_id": zach, "attendance": {date_str: status}})

        # 6. Сохраняем изменения
        attendance_record.attendance_json = attendance_data
        flag_modified(attendance_record, "attendance_json")
        self.db.commit()

        return {"message": f"Посещаемость обновлена"}
    



    """меняет статус по зачетке для одного студента."""
    def mark_attendance_to_many(
        self,
        teacher_first_name: str,
        teacher_last_name: str,
        group_name: str,
        subject_name: str,
        date_str: str,
        zach_list: List[str]
    ) -> dict:
    # 1. Ищем преподавателя
        teacher_user = (
            self.db.query(User)
            .filter(
                User.first_name == teacher_first_name,
                User.last_name == teacher_last_name,
                User.role == "teacher"
            )
            .first()
        )

        if not teacher_user or not teacher_user.teacher_info:
            return {"error": f"Преподаватель {teacher_first_name} {teacher_last_name} не найден"}

        teacher_info = teacher_user.teacher_info

        # 2. Ищем группу
        group = self.db.query(Groups).filter(Groups.group_name == group_name).first()
        if not group:
            return {"error": f"Группа '{group_name}' не найдена"}

        # 3. Ищем ведомость
        attendance_record = (
            self.db.query(Attendance)
            .filter(
                Attendance.teacher_id == teacher_info.id,
                Attendance.group_id == group.id,
                Attendance.subject_name == subject_name
            )
            .first()
        )

        if not attendance_record:
            return {"error": f"Ведомость по предмету '{subject_name}' не найдена для преподавателя {teacher_last_name} и группы {group_name}"}

        # 4. Загружаем существующую посещаемость
        attendance_data = attendance_record.attendance_json or []

        # 5. Обновляем 
        for std_attendance in attendance_data:
            for zach in zach_list:
                if std_attendance["student_id"] == zach:
                    std_attendance["attendance"][date_str] = True
                
        else:
            attendance_data.append({"student_id": zach, "attendance": {date_str: True}})

        # 6. Сохраняем изменения
        attendance_record.attendance_json = attendance_data
        flag_modified(attendance_record, "attendance_json")
        self.db.commit()

        return {"message": f"Посещаемость обновлена для предмета '{subject_name}' и группы '{group_name}'"}
    
