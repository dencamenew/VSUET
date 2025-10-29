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

@attendance_router.get(
    "/teacher/{first_name}/{last_name}/{subject_name}",
    summary="Получить ведомости преподавателя",
    description="Возвращает все ведомости (Attendance), которые должен заполнять преподаватель по ФИО и предмету.",
)
def get_teacher_attendances(
    first_name: str,
    last_name: str,
    subject_name: str,
    db: Session = Depends(get_db)
):
    service = AttendanceService(db)
    result = service.get_teacher_attendances(first_name, last_name, subject_name)

    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["detail"])

    return result["data"]