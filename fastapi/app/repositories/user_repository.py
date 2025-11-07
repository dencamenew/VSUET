from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.tables import StudentInfo, User
from app.models.enums import Role
from .base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)


    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()




    def get_by_username_with_relations(self, username: str) -> Optional[User]:
        return (
            self.db.query(User)
            .options(
                joinedload(User.student_info),
                joinedload(User.teacher_info)
            )
            .filter(User.username == username)
            .first()
        )




    def get_by_role(self, role: Role) -> List[User]:
        return self.db.query(User).filter(User.role == role).all()




    def exists_by_username(self, username: str) -> bool:
        return self.exists(username=username)




    def get_by_max_id(self, max_id: str) -> Optional[User]:
        """Получить пользователя по его max_id (из MAX Init Data)."""
        return self.db.query(User).filter(User.max_id == max_id).first()
    



    def get_by_max_id_with_relations(self, max_id: str) -> Optional[User]:
        """Получить пользователя по его max_id с загрузкой всех связанных данных."""
        return (
            self.db.query(User)
            .options(
                # Загружаем StudentInfo, а затем вложенно его Group
                joinedload(User.student_info).joinedload(StudentInfo.group), 
                joinedload(User.teacher_info)
                # Добавьте другие нужные отношения здесь
            )
            .filter(User.max_id == max_id)
            .first()
        )
    
    def get_by_max_id_teacher_info_id(self, max_id: str):
        """Получить teacher_info_id по его max_id."""
        return (
            self.db.query(User.teacher_info_id)
            .filter(User.max_id == max_id)
            .first()
        )
