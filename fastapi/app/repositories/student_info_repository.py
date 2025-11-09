from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.tables import StudentInfo, User
from .base_repository import BaseRepository


class StudentInfoRepository(BaseRepository[StudentInfo]):
    def __init__(self, db: Session):
        super().__init__(StudentInfo, db)

    def get_by_id(self, student_id: int) -> Optional[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.id == student_id).first()

    def get_by_student_name(self, student_name: str) -> Optional[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.student_name == student_name).first()

    def get_by_zach_number(self, zach_number: str) -> Optional[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.zach_number == zach_number).first()

    def get_by_group_id(self, group_id: int) -> List[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.group_id == group_id).all()


    def get_by_group_name(self, group_name: str) -> List[StudentInfo]:
        return (
            self.db.query(StudentInfo)
            .join(StudentInfo.group)
            .filter(StudentInfo.group.has(group_name=group_name))
            .all()
        )
    
    def get_student_name_by_zach_number(self, zach_number: str):
        """
        Возвращает имя и фамилию студента по его зачетке.
        """
        result = (
            self.db.query(User)
            .join(StudentInfo, User.student_info_id == StudentInfo.id)
            .filter(StudentInfo.zach_number == zach_number)
            .first()
        )

        if result:
            return {"first_name": result.first_name, "last_name": result.last_name}
        return None



