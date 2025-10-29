from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.config.database import get_db
from app.services.rating_service import RatingService
from app.repositories.teacher_info_repository import TeacherInfoRepository

rating_router = APIRouter(prefix="/api/admin/rating", tags=["rating"])


@rating_router.post("/generate")
async def generate_rating(
    teacher_name: str = Query(..., description="Teacher name"),
    db: Session = Depends(get_db)
):
    """Generate rating records for teacher"""
    try:
        teacher_info_repo = TeacherInfoRepository(db)
        timetable = teacher_info_repo.get_timetable_by_teacher_name(teacher_name)
        
        if not timetable:
            raise HTTPException(status_code=404, detail="Расписание преподавателя не найдено")
        
        # Convert JSON to TimetableDto
        from VSUET.fastapi.app.models.pydantic_models.pydantic_models import TimetableDto
        timetable_dto = TimetableDto(**timetable.timetable_json)
        
        rating_service = RatingService(db)
        rating_service.generate_rating_from_teacher_timetable(timetable_dto, teacher_name)
        
        return {"message": "Ведомости рейтинга успешно сгенерированы"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@rating_router.get("/group")
async def get_group_rating(
    group_name: str = Query(..., description="Group name"),
    subject_name: str = Query(..., description="Subject name"),
    db: Session = Depends(get_db)
):
    """Get group rating for specific subject"""
    rating_service = RatingService(db)
    rating = rating_service.get_group_rating(group_name, subject_name)
    return rating
