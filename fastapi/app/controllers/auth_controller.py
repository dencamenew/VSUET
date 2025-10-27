from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models import LoginRequest, LoginResponse, ErrorResponse
from app.services.auth_service import AuthService
from app.dto.exceptions import InvalidCredentialsException

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


@auth_router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """User login endpoint"""
    try:
        auth_service = AuthService(db)
        response = auth_service.login(request)
        return response
    except InvalidCredentialsException as e:
        raise HTTPException(status_code=401, detail=e.message)


@auth_router.exception_handler(InvalidCredentialsException)
async def invalid_credentials_handler(request, exc):
    return HTTPException(status_code=401, detail={"error": exc.message})
