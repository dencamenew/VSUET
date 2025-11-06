# app/services/rating_service.py
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.rating_repository import RatingRepository

class RatingService:
    def __init__(self, db: Session):
        self.db = db
        self.rating_repository = RatingRepository(db)

    def get_student_ratings(self, zach_number: str) -> Dict[str, Any]:
        """Получить рейтинги студента по всем предметам"""
        ratings = self.rating_repository.get_student_ratings(zach_number)
        
        result = {}
        for rating in ratings:
            # Находим рейтинг конкретного студента в JSON
            student_rating_data = None
            for student_data in rating.rating_json or []:
                if student_data.get("student_id") == zach_number:
                    student_rating_data = student_data.get("rating", {})
                    break
            
            if student_rating_data:
                result[rating.subject_name] = student_rating_data
        
        return result

    def get_group_rating(self, group_name: str, subject_name: str) -> Dict[str, Any]:
        """Получить рейтинг всей группы по предмету"""
        rating = self.rating_repository.get_group_rating(group_name, subject_name)
        
        if not rating:
            return {
                "group_name": group_name,
                "subject_name": subject_name,
                "ratings": []
            }
        
        return {
            "group_name": group_name,
            "subject_name": subject_name,
            "ratings": rating.rating_json or []
        }

    def update_student_mark(
        self, 
        zach_number: str, 
        subject_name: str, 
        control_point: str, 
        mark: int
    ) -> bool:
        """Обновить оценку студента"""
        return self.rating_repository.update_student_rating(
            zach_number, subject_name, control_point, mark
        )