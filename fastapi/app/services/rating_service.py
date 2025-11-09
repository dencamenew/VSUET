# app/services/rating_service.py
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.rating_repository import RatingRepository

class RatingService:
    def __init__(self, db: Session):
        self.db = db
        self.rating_repository = RatingRepository(db)

    def get_student_ratings(self, zach_number: str) -> Dict[str, Any]:
        """
        Получить все рейтинги студента по всем предметам,
        включая практику и курсовую работу.
        """
        ratings = self.rating_repository.get_student_ratings(zach_number)
        result = {}

        for rating in ratings:
            student_data = next(
                (s for s in rating.rating_json or [] if s.get("student_id") == zach_number),
                None
            )

            if not student_data:
                continue

            # Обычный предмет с контрольными точками
            if "rating" in student_data:
                result[rating.subject_name] = {
                    "type": rating.subject_type,
                    **student_data["rating"]
                }
            # Курсовая работа или практика
            elif "grade" in student_data:
                result[rating.subject_name] = {
                    "type": rating.subject_type,
                    "grade": student_data["grade"]
                }

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
        control_point: Optional[str],
        mark: Any
    ) -> bool:
        """
        Обновить оценку студента по предмету.
        Для обычных предметов — обновляется конкретная контрольная точка.
        Для курсовой работы или практики — обновляется grade.
        """
        # Сначала проверяем, есть ли студент в рейтинге по предмету
        student_rating = self.rating_repository.get_student_rating_by_subject(
            zach_number, subject_name
        )

        if student_rating is None:
            return False

        # Получаем объект рейтинга для определения типа предмета
        rating_obj = self.rating_repository.db.query(
            self.rating_repository.model
        ).filter(self.rating_repository.model.subject_name == subject_name).first()

        if not rating_obj:
            return False

        subject_type = (rating_obj.subject_type or "").lower().strip()

        # Курсовая работа или практика — обновляем grade
        if subject_type in ["практика", "курсовая работа"]:
            # Числовую оценку конвертируем в текстовую
            if isinstance(mark, (int, float)):
                if mark >= 90:
                    grade_value = "Отлично"
                elif mark >= 75:
                    grade_value = "Хорошо"
                elif mark >= 60:
                    grade_value = "Удовлетворительно"
                else:
                    grade_value = "Не зачёт"
            else:
                grade_value = str(mark).capitalize()

            return self.rating_repository.update_student_grade(
                zach_number, subject_name, grade_value
            )

        # Обычный предмет — обновляем конкретную контрольную точку
        else:
            try:
                mark_int = int(mark)
            except ValueError:
                return False

            if not (0 <= mark_int <= 100):
                return False

            return self.rating_repository.update_student_rating(
                zach_number, subject_name, control_point, mark_int
            )
