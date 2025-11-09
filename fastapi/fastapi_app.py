from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import engine, Base
from app.controllers.auth_controller import auth_router
from app.controllers.attendance_controller import attendance_router
from app.controllers.rating_controller import rating_router
from app.controllers.timetable_controller import timetable_router
from app.controllers.user_controller import user_router
from app.controllers.student_info_controller import student_info_router
from app.controllers.groups_controller import groups_router
# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="VSUET API",
    description="FastAPI version of VSUET system",
    version="1.0.0",
    docs_url="/docs",  # Явно указываем URL для документации
    redoc_url="/redoc"
)

# Add CORS middleware with comprehensive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:3000", "https://vsuet-xcmz.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]  # Добавляем для полной совместимости
)

# Include routers
app.include_router(auth_router)
app.include_router(attendance_router)
app.include_router(rating_router)
app.include_router(timetable_router)
app.include_router(user_router)
app.include_router(student_info_router)
app.include_router(groups_router)


@app.get("/")
async def root():
    return {"message": "VSUET FastAPI System", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/cors-test")
async def cors_test():
    """Endpoint для тестирования CORS"""
    return {"message": "CORS is working!", "cors_enabled": True}