from typing import List
from sqlalchemy.orm import Session
from app.models.tables import Rating
from .base_repository import BaseRepository


class RatingRepository(BaseRepository[Rating]):
    def __init__(self, db: Session):
        super().__init__(Rating, db)

    def get_by_teacher_name(self, teacher_name: str) -> List[Rating]:
        return self.db.query(Rating).filter(Rating.teacher_name == teacher_name).all()

    def get_by_group_name(self, group_name: str) -> List[Rating]:
        return self.db.query(Rating).filter(Rating.group_name == group_name).all()

    def get_by_group_and_subject(self, group_name: str, subject_name: str) -> List[Rating]:
        return (
            self.db.query(Rating)
            .filter(
                Rating.group_name == group_name,
                Rating.subject_name == subject_name
            )
            .all()
        )



