from typing import List, Dict, Any
from sqlalchemy.orm import Session
import json
from app.models.pydantic_models import TimetableDto
from app.repositories.rating_repository import RatingRepository
from app.repositories.teacher_info_repository import TeacherInfoRepository


class RatingService:
    def __init__(self, db: Session):
        self.db = db
        self.rating_repository = RatingRepository(db)
        self.teacher_info_repository = TeacherInfoRepository(db)

    def generate_rating_from_teacher_timetable(self, timetable: TimetableDto, teacher_name: str) -> None:
        """Generate rating records from teacher timetable"""
        # This is a simplified implementation
        # In a real application, you would need to process the timetable
        # and create rating records for each lesson
        
        # For now, we'll create a placeholder rating record
        rating_data = {
            "teacher_name": teacher_name,
            "period": "2024-1",
            "subject_type": "lecture",
            "subject_name": "Sample Subject",
            "group_name": "Sample Group",
            "report_json": {
                "students": [
                    {"studentId": 1, "rating": ["-", "-", "-", "-", "-"]},
                    {"studentId": 2, "rating": ["5", "4", "5", "4", "5"]}
                ]
            }
        }
        self.rating_repository.create(rating_data)

    def get_group_rating(self, group_name: str, subject_name: str) -> List[Dict[str, Any]]:
        """Get group rating for a specific subject"""
        ratings = self.rating_repository.get_by_group_and_subject(group_name, subject_name)
        result = []
        for rating in ratings:
            result.append({
                "id": rating.id,
                "teacher_name": rating.teacher_name,
                "period": rating.period,
                "subject_type": rating.subject_type,
                "subject_name": rating.subject_name,
                "group_name": rating.group_name,
                "report_json": rating.report_json
            })
        return result
