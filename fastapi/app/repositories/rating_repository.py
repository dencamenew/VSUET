# app/repositories/rating_repository.py
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy.orm.attributes import flag_modified
from app.models.tables import Rating, StudentInfo, Groups
from .base_repository import BaseRepository

class RatingRepository(BaseRepository[Rating]):
    def __init__(self, db: Session):
        super().__init__(Rating, db)

    def get_student_ratings(self, zach_number: str) -> List[Rating]:
        return self.db.query(Rating).join(
            StudentInfo, Rating.group_id == StudentInfo.group_id
        ).filter(
            StudentInfo.zach_number == zach_number
        ).all()

    def get_group_rating(self, group_name: str, subject_name: str) -> Optional[Rating]:
        return self.db.query(Rating).join(
            Groups, Rating.group_id == Groups.id
        ).filter(
            and_(
                Groups.group_name == group_name,
                Rating.subject_name == subject_name
            )
        ).first()

    def get_student_rating_by_subject(self, zach_number: str, subject_name: str) -> Optional[Dict]:
        student = self.db.query(StudentInfo).filter(
            StudentInfo.zach_number == zach_number
        ).first()
        if not student:
            return None

        rating = self.db.query(Rating).filter(
            and_(
                Rating.group_id == student.group_id,
                Rating.subject_name == subject_name
            )
        ).first()
        if not rating or not rating.rating_json:
            return None

        for student_rating in rating.rating_json:
            if student_rating.get("student_id") == zach_number:
                return student_rating.get("rating", {}) or {"grade": student_rating.get("grade")}

        return None

    def update_student_rating(
        self, zach_number: str, subject_name: str, control_point: Optional[str], mark: Any
    ) -> bool:
        """Обновить оценку студента и сделать изменения видимыми сразу в любой сессии"""
        try:
            student = self.db.query(StudentInfo).filter(StudentInfo.zach_number == zach_number).first()
            if not student:
                return False

            rating = self.db.query(Rating).filter(
                and_(Rating.group_id == student.group_id, Rating.subject_name == subject_name)
            ).first()
            if not rating:
                return False

            rating_data = rating.rating_json or []

            student_found = False
            for student_rating in rating_data:
                if student_rating["student_id"] == zach_number:
                    if control_point:
                        student_rating.setdefault("rating", {})[control_point] = mark
                    else:
                        student_rating["grade"] = mark
                    student_found = True
                    break

            if not student_found:
                new_student = {"student_id": zach_number}
                if control_point:
                    new_student["rating"] = {control_point: mark}
                else:
                    new_student["grade"] = mark
                rating_data.append(new_student)

            # Обновляем JSON
            rating.rating_json = list(rating_data)
            flag_modified(rating, "rating_json")

            self.db.commit()
            self.db.expire_all()    # 🔹 сброс кеша всех объектов в сессии
            self.db.refresh(rating) # 🔹 объект сразу обновлён для текущей сессии

            return True

        except Exception as e:
            self.db.rollback()
            print(f"Ошибка обновления: {e}")
            import traceback
            print(traceback.format_exc())
            return False

    def update_student_grade(self, zach_number: str, subject_name: str, grade: str) -> bool:
        """Обновить итоговую оценку и сделать её видимой сразу"""
        rating = self.db.query(Rating).filter(
            Rating.subject_name == subject_name
        ).first()
        if not rating:
            return False

        updated = False
        for student_data in rating.rating_json or []:
            if student_data.get("student_id") == zach_number:
                student_data["grade"] = grade
                updated = True
                break

        if updated:
            rating.rating_json = rating.rating_json
            flag_modified(rating, "rating_json")
            self.db.commit()
            self.db.expire_all()
            self.db.refresh(rating)
            return True

        return False

    def create_rating(self, rating_data: Dict[str, Any]) -> Rating:
        """Создать новую запись рейтинга"""
        rating = Rating(**rating_data)
        self.db.add(rating)
        self.db.commit()
        self.db.refresh(rating)
        return rating
