from typing import Optional
from sqlalchemy.orm import Session
from app.models.tables import TeacherInfo, TeacherTimetable
from .base_repository import BaseRepository


class TeacherTimetableRepository:
    def __init__(self, db: Session):
        self.db = db
        self.base_repo = BaseRepository(TeacherTimetable, db)

    def get_by_teacher_info_id(self, teacher_info_id: int) -> Optional[TeacherTimetable]:
        """Получить расписание преподавателя через связь с TeacherInfo"""
        return self.db.query(TeacherTimetable)\
            .join(TeacherInfo, TeacherTimetable.id == TeacherInfo.timetable_id)\
            .filter(TeacherInfo.id == teacher_info_id)\
            .first()

    