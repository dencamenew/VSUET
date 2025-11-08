from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.tables import Groups, StudentInfo, User
from .base_repository import BaseRepository


class GroupsRepository(BaseRepository[Groups]):
    def __init__(self, db: Session):
        super().__init__(Groups, db)

    def get_by_group_name(self, group_name: str) -> Optional[Groups]:
        return self.db.query(Groups).filter(Groups.group_name == group_name).first()

    def get_by_id(self, group_id: int) -> Optional[Groups]:
        return self.db.query(Groups).filter(Groups.id == group_id).first()

    def get_timetable_by_group_id(self, group_id: int) -> Optional[Groups]:
        return (
            self.db.query(Groups)
            .filter(Groups.id == group_id)
            .first()
        )
    
    def get_students_by_group_name(self, group_name: str):
        """
        Получить всех студентов (фамилия, имя, зачётка) по названию группы.
        """
        result = (
        self.db.query(User.first_name, User.last_name, StudentInfo.zach_number)
        .join(StudentInfo, User.student_info_id == StudentInfo.id)
        .join(Groups, StudentInfo.group_id == Groups.id)
        .filter(Groups.group_name == group_name)
        .all()
    )

        # Конвертация в список словарей
        students = [
            {
                "first_name": row.first_name,
                "last_name": row.last_name,
                "zach_number": row.zach_number
            }
            for row in result
        ]

        return students