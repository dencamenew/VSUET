from typing import Optional
from sqlalchemy.orm import Session
from app.models.tables import TeacherInfo, TeacherTimetable
from .base_repository import BaseRepository


class TeacherInfoRepository(BaseRepository[TeacherInfo]):
    def __init__(self, db: Session):
        super().__init__(TeacherInfo, db)

    def get_by_teacher_name(self, teacher_name: str) -> Optional[TeacherInfo]:
        return self.db.query(TeacherInfo).filter(TeacherInfo.teacher_name == teacher_name).first()

    def get_timetable_by_teacher_name(self, teacher_name: str) -> Optional[TeacherTimetable]:
        return (
            self.db.query(TeacherTimetable)
            .join(TeacherInfo)
            .filter(TeacherInfo.teacher_name == teacher_name)
            .first()
        )
    
    def get_by_id(self, teacher_id: int) -> Optional[TeacherInfo]:
        """Получить преподавателя по его ID"""
        return self.db.query(TeacherInfo).filter(TeacherInfo.id == teacher_id).first()