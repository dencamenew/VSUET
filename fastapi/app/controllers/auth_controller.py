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
    ErrorResponse,
    UpdateMaxIdRequest,
    CheckMaxIdRequest
)
from app.models.tables import User



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
    "/login_user", 
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


@auth_router.put(
    "/register",
    response_model=Dict[str, str],
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    }
)
async def update_max_id(
    request: UpdateMaxIdRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Обновляет MAX_id для пользователя по имени, фамилии и паролю.
    """
    try:
        # Ищем пользователя
        user = (
            db.query(User)
            .filter(
                User.first_name == request.first_name,
                User.last_name == request.last_name,
                User.passwd == request.password
            )
            .first()
        )

        user.max_id = request.max_id

        if not user:
            raise HTTPException(
                status_code=404,
                detail={"message": "User not found", "error": "UserNotFound"}
            )

        # Обновляем max_id
        user.MAX_id = request.max_id
        db.commit()

        return {"message": "MAX_id updated successfully", "max_id": request.max_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Internal Server Error", "error": str(e)}
        )


@auth_router.post(
    "/check",
    response_model=Dict[str, Any],
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def check_user_by_max_id(
    request: CheckMaxIdRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Проверяет наличие пользователя по max_id.
    """
    try:
        user = (
            db.query(User)
            .filter(User.max_id == request.max_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail={"message": "User not found", "error": "UserNotFound"}
            )

        return {
            "message": "User found",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "max_id": user.max_id,
                "password": user.passwd
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Internal Server Error", "error": str(e)}
        )