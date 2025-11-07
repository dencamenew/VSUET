from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.dto.requests import MarkAttendanceToManyRequest, MarkAttendanceToOneRequest
from app.config.database import get_db
from app.services.attendance_service import AttendanceService
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.utils.jwt import get_current_user_id

attendance_router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@attendance_router.get("/student/{group_name}/{zach_number}", summary="Эндпоинт для получения всех ведомостей посещаемости студента по названию группы и номеру зачетки.")
def get_student_attendance(
    group_name: str,
    zach_number: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id) 
):
    service = AttendanceService(db)
    result = service.get_student_attendance(group_name, zach_number)

    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["detail"])

    return result["data"]

@attendance_router.get(
    "/teacher/{first_name}/{last_name}/{subject_name}",
    summary="Эндпоинт для получения всех ведомостей посещаемоести, которые ведет преподаватель."
)
def get_teacher_attendances(
    first_name: str,
    last_name: str,
    subject_name: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    service = AttendanceService(db)
    result = service.get_teacher_attendances(first_name, last_name, subject_name)

    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["detail"])

    return result["data"]

@attendance_router.post("/teacher/mark-to-one", summary="Эндпоинт для выставления статуса(true/false) в ведомость посещаемости на основе номера зачетки.")
def mark_to_one(request: MarkAttendanceToOneRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id) ):
    service = AttendanceService(db)

    result = service.mark_to_one(
        teacher_first_name=request.teacher_first_name,
        teacher_last_name=request.teacher_last_name,
        group_name=request.group_name,
        subject_name=request.subject_name,
        date=request.date,
        zach=request.zach,
        status=request.status)
    
    return result

@attendance_router.post("/teacher/mark-to-many", summary="Эндпоинт для выставления статуса(true) о посещаемости. !!!Для автоматизтрованного учета!!!")
def mark_to_many(request: MarkAttendanceToManyRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id) ):
    service = AttendanceService(db)

    result = service.mark_to_many(
        teacher_first_name=request.teacher_first_name,
        teacher_last_name=request.teacher_last_name,
        group_name=request.group_name,
        subject_name=request.subject_name,
        date=request.date,
        zach_list=request.zach_list)
    
    return result