# app/repositories/rating_repository.py
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.tables import Rating, StudentInfo, Groups
from .base_repository import BaseRepository
from sqlalchemy.orm.attributes import flag_modified

class RatingRepository(BaseRepository[Rating]):
    def __init__(self, db: Session):
        super().__init__(Rating, db)

    def get_student_ratings(self, zach_number: str) -> List[Rating]:
        """Получить все рейтинги студента по номеру зачётки"""
        return self.db.query(Rating).join(
            StudentInfo, Rating.group_id == StudentInfo.group_id
        ).filter(
            StudentInfo.zach_number == zach_number
        ).all()

    def get_group_rating(self, group_name: str, subject_name: str) -> Optional[Rating]:
        """Получить рейтинг группы по конкретному предмету"""
        return self.db.query(Rating).join(
            Groups, Rating.group_id == Groups.id
        ).filter(
            and_(
                Groups.group_name == group_name,
                Rating.subject_name == subject_name
            )
        ).first()

    def update_student_rating(
        self, 
        zach_number: str, 
        subject_name: str, 
        control_point: str, 
        mark: int
    ) -> bool:
        """Обновить рейтинг студента по контрольной точке - ПО АНАЛОГИИ С ATTENDANCE"""
        try:
            print(f"🔍 Поиск студента: {zach_number}")
            
            # 1. Находим студента
            student = self.db.query(StudentInfo).filter(
                StudentInfo.zach_number == zach_number
            ).first()
            
            if not student:
                print(f"❌ Студент {zach_number} не найден")
                return False

            print(f"✅ Студент найден, group_id: {student.group_id}")
            
            # 2. Находим рейтинг
            rating = self.db.query(Rating).filter(
                and_(
                    Rating.group_id == student.group_id,
                    Rating.subject_name == subject_name
                )
            ).first()

            if not rating:
                print(f"❌ Рейтинг для группы {student.group_id}, предмет {subject_name} не найден")
                return False

            print(f"✅ Рейтинг найден, ID: {rating.id}")
            print(f"📊 Текущий rating_json: {rating.rating_json}")

            # 3. Загружаем существующий рейтинг (как в attendance)
            rating_data = rating.rating_json or []

            # 4. Обновляем или добавляем студента (как в attendance)
            student_found = False
            for student_rating in rating_data:
                if student_rating["student_id"] == zach_number:
                    # Обновляем существующего студента
                    if "rating" not in student_rating:
                        student_rating["rating"] = {}
                    student_rating["rating"][control_point] = mark
                    student_found = True
                    print(f"✏️ Обновлен существующий студент: {student_rating}")
                    break

            if not student_found:
                # Добавляем нового студента
                new_student_rating = {
                    "student_id": zach_number,
                    "rating": {control_point: mark}
                }
                rating_data.append(new_student_rating)
                print(f"➕ Добавлен новый студент: {new_student_rating}")

            # 5. Сохраняем изменения (ВАЖНО: как в attendance)
            rating.rating_json = rating_data
            flag_modified(rating, "rating_json")  # КРИТИЧЕСКИ ВАЖНО ДЛЯ JSON
            self.db.commit()

            print(f"✅ Успешно обновлено! Новый rating_json: {rating.rating_json}")
            return True

        except Exception as e:
            self.db.rollback()
            print(f"❌ Ошибка при обновлении рейтинга: {str(e)}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            return False

    def create_rating(self, rating_data: Dict[str, Any]) -> Rating:
        """Создать новую запись рейтинга"""
        rating = Rating(**rating_data)
        self.db.add(rating)
        self.db.commit()
        self.db.refresh(rating)
        return rating

    def get_student_rating_by_subject(self, zach_number: str, subject_name: str) -> Optional[Dict]:
        """Получить рейтинг конкретного студента по предмету"""
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
                return student_rating.get("rating", {})

        return None