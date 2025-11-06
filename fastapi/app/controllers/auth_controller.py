from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse, MaxIdRequest
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException

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