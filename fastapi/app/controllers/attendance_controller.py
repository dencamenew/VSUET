from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.dto.requests import MarkAttendanceToManyRequest, MarkAttendanceToOneRequest
from app.config.database import get_db
from app.services.attendance_service import AttendanceService
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.utils.jwt import get_current_user_id, require_role


attendance_router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@attendance_router.get("/student/{subject_name}/{subject_type}", summary="Эндпоинт для получения ведомости посещаемости студента по названию и типу предмета.")
def get_student_attendance(
    subject_name: str,
    subject_type: str,
    db: Session = Depends(get_db),
    max_id: str = Depends(get_current_user_id) 
):
    service = AttendanceService(db)
    result = service.get_student_attendance(max_id=max_id, subject_name=subject_name, subject_type=subject_type)

    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["detail"])

    return result["data"]




@attendance_router.get(
    "/teacher/{group_name}/{subject_type}/{subject_name}",
    summary="Эндпоинт для получения ведомости посещаемоести, которую ведет преподаватель по названию группы, названию и типу предмета."
)
def get_teacher_attendances(
    group_name: str,
    subject_type: str,
    subject_name: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("teacher"))
):
    max_id = user["max_id"]
    service = AttendanceService(db)
    result = service.get_teacher_attendance(max_id, group_name, subject_type, subject_name)

    return result




@attendance_router.post(
    "/teacher/mark-to-one", 
    summary="Эндпоинт для выставления статуса(true/false) в ведомость посещаемости на основе номера зачетки."
)
def mark_to_one(
                group_name: str,
                subject_name: str,
                subject_type: str,
                date: str,
                zach: str,
                status: bool,
                db: Session = Depends(get_db),
                user=Depends(require_role("teacher"))
                ):
    service = AttendanceService(db)

    max_id = user["max_id"]

    result = service.mark_to_one(
        max_id=max_id,
        group_name=group_name,
        subject_name=subject_name,
        date=date,
        zach=zach,
        status=status,
        subject_type=subject_type)
    
    return result

# @attendance_router.post("/teacher/mark-to-many", summary="Эндпоинт для выставления статуса(true) о посещаемости. !!!Для автоматизтрованного учета!!!")
# def mark_to_many(request: MarkAttendanceToManyRequest, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id) ):
#     service = AttendanceService(db)

#     result = service.mark_to_many(
#         teacher_first_name=request.teacher_first_name,
#         teacher_last_name=request.teacher_last_name,
#         group_name=request.group_name,
#         subject_name=request.subject_name,
#         date=request.date,
#         zach_list=request.zach_list)
    
#     return result