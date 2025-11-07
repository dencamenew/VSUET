from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.dto.requests import MarkAttendanceToManyRequest, MarkAttendanceToOneRequest
from app.config.database import get_db
from app.services.attendance_service import AttendanceService
from app.repositories.teacher_info_repository import TeacherInfoRepository
from app.utils.jwt import get_current_user_id
from app.services.timetable_service import TimetableService

timetable_router = APIRouter(prefix="/api/my/timetable", tags=["timetable"])

@timetable_router.get("/student/{group_name}/{zach_number}", summary="Эндпоинт для получения расписания пользователя(студент/преподаватель) по MAX ID передаваемому в jwt токене.")
def get_student_attendance(
    db: Session = Depends(get_db),
    max_id: str = Depends(get_current_user_id) 
):
    service = TimetableService(db)
    timetable = service.get_my_timetable_by_max_id(max_id)
    result ={"timetable": timetable}

    return result