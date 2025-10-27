from typing import Optional
from sqlalchemy.orm import Session
from app.models.database import Faculty
from .base_repository import BaseRepository


class FacultyRepository(BaseRepository[Faculty]):
    def __init__(self, db: Session):
        super().__init__(Faculty, db)

    def get_by_name(self, name: str) -> Optional[Faculty]:
        return self.db.query(Faculty).filter(Faculty.name == name).first()

    def exists_by_name(self, name: str) -> bool:
        return self.exists(name=name)



