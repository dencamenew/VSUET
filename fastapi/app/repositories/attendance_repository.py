from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.tables import Attendance, Groups, TeacherInfo, User
from .base_repository import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(Attendance, db)

    def get_student_attendance(self, group_name: str, zach_number: str) -> Dict:
        """Возвращает все ведомости посещаемости студента по номеру зачетки и названию группы."""
        group = self.db.query(Groups).filter(Groups.group_name == group_name).first()
        if not group:
            return {"error": f"Группа '{group_name}' не найдена"}

        attendances = self.db.query(Attendance).filter(Attendance.group_id == group.id).all()
        student_attendance_by_subject = []

        for attendance_record in attendances:
            subject_name = attendance_record.subject_name
            attendance_list = attendance_record.attendance_json

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

    def get_ved_for_teacher(self, first_name: str, last_name: str, subject_name: str) -> List[Dict[str, Any]]:
        """
        Возвращает все ведомости, которые должен заполнять конкретный учитель
        по его имени, фамилии и названию предмета.
        """

        teacher_user = (
            self.db.query(User)
            .filter(
                User.first_name == first_name,
                User.last_name == last_name,
                User.role == "teacher"
            )
            .first()
        )

        if not teacher_user:
            return [{"error": f"Учитель {first_name} {last_name} не найден"}]

        # Получаем TeacherInfo
        teacher_info = teacher_user.teacher_info
        if not teacher_info:
            return [{"error": f"У пользователя {first_name} {last_name} нет связанных данных о преподавателе"}]

        # Получаем ведомости (Attendance)
        attendances = (
            self.db.query(Attendance)
            .filter(
                Attendance.teacher_id == teacher_info.id,
                Attendance.subject_name == subject_name
            )
            .all()
        )

        # Преобразуем для фронта
        result = []
        for a in attendances:
            group = self.db.query(Groups).filter(Groups.id == a.group_id).first()
            result.append({
                "subject_name": a.subject_name,
                "group_name": group.group_name if group else None,
                "semestr": a.semestr,
                "created_at": a.created_at,
                "attendance_json": a.attendance_json
            })

        return result