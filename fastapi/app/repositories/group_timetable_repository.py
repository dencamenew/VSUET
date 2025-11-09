from typing import Optional
from sqlalchemy.orm import Session
from app.models.tables import GroupTimetable
from .base_repository import BaseRepository


class GroupTimetableRepository:
    def __init__(self, db: Session):
        self.db = db
        self.base_repo = BaseRepository(GroupTimetable, db)

    def get_by_group_id(self, group_id: int) -> Optional[GroupTimetable]:
        """Получить расписание по ID группы"""
        return self.db.query(GroupTimetable)\
            .filter(GroupTimetable.group_id == group_id)\
            .first()