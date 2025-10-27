from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.dean_info_repository import DeanInfoRepository
from app.repositories.faculty_repository import FacultyRepository


class DeanInfoService:
    def __init__(self, db: Session):
        self.db = db
        self.dean_info_repository = DeanInfoRepository(db)
        self.faculty_repository = FacultyRepository(db)

    def get_dean_info(self, dean_id: int) -> Optional[Dict[str, Any]]:
        """Get dean information by ID"""
        dean = self.dean_info_repository.get(dean_id)
        if not dean:
            return None
        
        return {
            "id": dean.id,
            "dean_name": dean.dean_name,
            "faculty_name": dean.faculty.name if dean.faculty else None
        }

    def get_deans_by_faculty(self, faculty_id: int) -> List[Dict[str, Any]]:
        """Get all deans by faculty ID"""
        deans = self.dean_info_repository.get_by_faculty_id(faculty_id)
        return [{
            "id": dean.id,
            "dean_name": dean.dean_name,
            "faculty_name": dean.faculty.name if dean.faculty else None
        } for dean in deans]

    def get_all_deans(self) -> List[Dict[str, Any]]:
        """Get all deans"""
        deans = self.dean_info_repository.get_multi()
        return [{
            "id": dean.id,
            "dean_name": dean.dean_name,
            "faculty_name": dean.faculty.name if dean.faculty else None
        } for dean in deans]
