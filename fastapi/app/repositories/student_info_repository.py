from typing import Optional, List
from sqlalchemy.orm import Session
from VSUET.fastapi.app.models.tables import StudentInfo
from .base_repository import BaseRepository


class StudentInfoRepository(BaseRepository[StudentInfo]):
    def __init__(self, db: Session):
        super().__init__(StudentInfo, db)

    def get_by_student_name(self, student_name: str) -> Optional[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.student_name == student_name).first()

    def get_by_zach_number(self, zach_number: str) -> Optional[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.zach_number == zach_number).first()

    def get_by_group_id(self, group_id: int) -> List[StudentInfo]:
        return self.db.query(StudentInfo).filter(StudentInfo.group_id == group_id).all()

    def get_by_faculty_id(self, faculty_id: int) -> List[StudentInfo]:
        return (
            self.db.query(StudentInfo)
            .join(StudentInfo.group)
            .filter(StudentInfo.group.has(faculty_id=faculty_id))
            .all()
        )

    def get_by_group_name(self, group_name: str) -> List[StudentInfo]:
        return (
            self.db.query(StudentInfo)
            .join(StudentInfo.group)
            .filter(StudentInfo.group.has(group_name=group_name))
            .all()
        )



