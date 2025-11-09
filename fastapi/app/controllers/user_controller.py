from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse, MaxIdRequest
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import get_current_user_id
from fastapi import status

user_router = APIRouter(prefix="/api/user", tags=["user"])




@user_router.get("/me", response_model=Dict[str, Any])
async def user_me(
    max_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Получает информацию о текущем авторизованном пользователе.
    Требует JWT токен в заголовке Authorization: Bearer <token>.
    """
    try:
        auth_service = AuthService(db)
        user_data = auth_service.get_user_me_info(max_id) 
        return user_data
    
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": f"Ошибка сервера: {str(e)}"}
        )