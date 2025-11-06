from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse, MaxIdRequest
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import get_current_user_id

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


@auth_router.post("/login_max_id", response_model=Dict[str, str])
async def login_by_max_id_token_only(
    request: MaxIdRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Эндпоинт для входа с использованием POST-запроса и max_id в теле.
    Возвращает только JWT токен.
    """
    try:
        auth_service = AuthService(db)
        # Используем max_id из тела запроса
        response = auth_service.login_by_max_id_token_only(request.max_id) 
        return response
    except InvalidCredentialsException as e:
        raise HTTPException(
            status_code=401,
            detail={"message": str(e), "error": "InvalidCredentials"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Internal Server Error", "error": str(e)}
        )

@auth_router.get("/user/me", response_model=Dict[str, Any])
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
        # Передаем max_id в сервис
        user_data = auth_service.get_user_me_info(max_id) 
        return user_data
    
    except EntityNotFoundException as e:
        # Токен валиден, но ID не найден в базе (пользователь удален)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": str(e)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": f"Ошибка сервера: {str(e)}"}
        )