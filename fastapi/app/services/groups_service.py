# app/services/rating_service.py
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.rating_repository import RatingRepository
from app.repositories.groups_repository import GroupsRepository

class GroupsService:
    def __init__(self, db: Session):
        self.db = db
        self.groups_repository = GroupsRepository(db)
    

    def get_students_by_group_name(self, group_name: str):
        studednts = self.groups_repository.get_students_by_group_name(group_name=group_name)
        result = {
            "group_name": group_name,
            "students": studednts
        }
        return result
    

  