from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.tables import Groups
from .base_repository import BaseRepository


class GroupsRepository(BaseRepository[Groups]):
    def __init__(self, db: Session):
        super().__init__(Groups, db)

    def get_by_group_name(self, group_name: str) -> Optional[Groups]:
        return self.db.query(Groups).filter(Groups.group_name == group_name).first()

    def get_by_faculty_id(self, faculty_id: int) -> List[Groups]:
        return self.db.query(Groups).filter(Groups.faculty_id == faculty_id).all()

    def get_timetable_by_group_id(self, group_id: int) -> Optional[Groups]:
        return (
            self.db.query(Groups)
            .filter(Groups.id == group_id)
            .first()
        )
