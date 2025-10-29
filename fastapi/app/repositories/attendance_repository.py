from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.tables import Attendance, Groups, TeacherInfo, User
from .base_repository import BaseRepository
from app.dto.attendance_ved_dto import AttendanceDTO
from sqlalchemy.orm.attributes import flag_modified



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


    def mark_attendance_to_one(
        self,
        teacher_first_name: str,
        teacher_last_name: str,
        group_name: str,
        subject_name: str,
        date_str: str,
        zach: str,
        status: bool
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

        return {"message": f"Посещаемость обновлена для предмета '{subject_name}' и группы '{group_name}'"}