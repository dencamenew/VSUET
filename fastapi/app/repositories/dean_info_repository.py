from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.database import DeanInfo
from .base_repository import BaseRepository


class DeanInfoRepository(BaseRepository[DeanInfo]):
    def __init__(self, db: Session):
        super().__init__(DeanInfo, db)

    def get_by_dean_name(self, dean_name: str) -> Optional[DeanInfo]:
        return self.db.query(DeanInfo).filter(DeanInfo.dean_name == dean_name).first()

    def get_by_faculty_id(self, faculty_id: int) -> List[DeanInfo]:
        return self.db.query(DeanInfo).filter(DeanInfo.faculty_id == faculty_id).all()
