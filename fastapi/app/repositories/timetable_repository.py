from typing import Optional
from sqlalchemy.orm import Session
from app.models.database import GroupTimetable, TeacherTimetable
from .base_repository import BaseRepository


class TimetableRepository:
    def __init__(self, db: Session):
        self.db = db
        self.group_timetable_repo = BaseRepository(GroupTimetable, db)
        self.teacher_timetable_repo = BaseRepository(TeacherTimetable, db)

    def create_group_timetable(self, timetable_data: dict) -> GroupTimetable:
        return self.group_timetable_repo.create(timetable_data)

    def create_teacher_timetable(self, timetable_data: dict) -> TeacherTimetable:
        return self.teacher_timetable_repo.create(timetable_data)

    def get_group_timetable(self, timetable_id: int) -> Optional[GroupTimetable]:
        return self.group_timetable_repo.get(timetable_id)

    def get_teacher_timetable(self, timetable_id: int) -> Optional[TeacherTimetable]:
        return self.teacher_timetable_repo.get(timetable_id)

    def delete_group_timetable(self, timetable_id: int) -> Optional[GroupTimetable]:
        return self.group_timetable_repo.delete(timetable_id)

    def delete_teacher_timetable(self, timetable_id: int) -> Optional[TeacherTimetable]:
        return self.teacher_timetable_repo.delete(timetable_id)



