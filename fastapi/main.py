from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import engine, Base
from app.controllers.auth_controller import auth_router
from app.controllers.admin_controller import admin_router
from app.controllers.attendance_controller import attendance_router
from app.controllers.rating_controller import rating_router
from app.controllers.search_controller import search_router
from app.controllers.info_controller import info_router
from app.controllers.dean_info_controller import dean_info_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="VSUET API",
    description="FastAPI version of VSUET system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(attendance_router)
app.include_router(rating_router)
app.include_router(search_router)
app.include_router(info_router)
app.include_router(dean_info_router)


@app.get("/")
async def root():
    return {"message": "VSUET FastAPI System", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
