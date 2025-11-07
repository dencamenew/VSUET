from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse, MaxIdRequest
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import get_current_user_id
from fastapi import status
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

    return result

    

