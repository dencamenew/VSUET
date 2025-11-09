from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse, MaxIdRequest
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import get_current_user_id
from fastapi import status
from app.services.groups_service import GroupsService

groups_router = APIRouter(prefix="/api/groups", tags=["groups"])


@groups_router.get("/students/{group_name}", summary="Возвращает имя+фамилия+зачетка всех студентов шруппы по названию")
async def get_studens_info_by_group_name(
    group_name: str,
    db: Session = Depends(get_db),
    max_id: str = Depends(get_current_user_id)
):
    """
    ----
    """
    service = GroupsService(db)
    result = service.get_students_by_group_name(group_name=group_name)
    return result
   

