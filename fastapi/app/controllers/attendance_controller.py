from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.config.database import get_db
from app.services.attendance_service import AttendanceService
from app.repositories.teacher_info_repository import TeacherInfoRepository

attendance_router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@attendance_router.get("/student/{group_name}/{zach_number}", summary="Для фронта студента.")
def get_student_attendance(
    group_name: str,
    zach_number: str,
    db: Session = Depends(get_db)
):
    """
    Эндпоинт для получения всех ведомостей посещаемости студента
    по названию группы и номеру зачетки.
    """
    service = AttendanceService(db)
    result = service.get_student_attendance(group_name, zach_number)

    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["detail"])

    return result["data"]