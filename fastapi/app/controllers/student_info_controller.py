from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.utils.jwt import get_current_user_id
from app.services.student_info_service import StudentInfoService

student_info_router = APIRouter(prefix="/api/student_info", tags=["student_info"])


@student_info_router.get("/zach_info", summary="По номеру зачетки возвращает имя и фамилию студента.")
async def login_by_max_id_token_only(
    zach: str,
    max_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Преподаватель по зачетке получает имя и фамилию студента
    """
    service = StudentInfoService(db)
    result = service.get_student_name_by_zach_number(zach)

    if not result:
        raise HTTPException(status_code=404, detail=f"Студент с номером зачетки {zach} не найден")

    return result


@student_info_router.get(
    "/subjects_by_zach",
    summary="Возвращает список предметов студента по номеру зачетки."
)
async def subjects_by_zach(
    zach_number: str,
    db: Session = Depends(get_db)
) -> Dict[str, List[Dict[str, str]]]:
    """
    Возвращает список предметов студента в формате:
    {
        "zach_number": [
            {"subject_name": "Математика", "subject_type": "Lecture"},
            ...
        ]
    }
    """
    service = StudentInfoService(db)
    result = service.get_subjects_by_zach_number(zach_number)

    if not result:
        raise HTTPException(status_code=404, detail=f"Студент с номером зачетки {zach_number} не найден или не имеет предметов")

    return result
