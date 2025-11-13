from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse, MaxIdRequest
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException
from app.utils.jwt import get_current_user_id
from fastapi import status
from app.models.pydantic_models.pydantic_models import (
    NamePasswordAuthRequest, 
    NamePasswordAuthResponse,
    ErrorResponse
)

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

@auth_router.post(
    "/login_name_password", 
    response_model=NamePasswordAuthResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def login_by_name_password(
    request: NamePasswordAuthRequest,
    db: Session = Depends(get_db)
) -> NamePasswordAuthResponse:
    """
    Эндпоинт для входа по имени, фамилии и паролю.
    Возвращает информацию о пользователе включая роль и MAX_id.
    """
    try:
        auth_service = AuthService(db)
        user_info = auth_service.login_by_name_password(
            first_name=request.first_name,
            last_name=request.last_name,
            password=request.password
        )
        return NamePasswordAuthResponse(**user_info)
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

