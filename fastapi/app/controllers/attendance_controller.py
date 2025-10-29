from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.config.database import get_db
from app.services.attendance_service import AttendanceService
from app.repositories.teacher_info_repository import TeacherInfoRepository

attendance_router = APIRouter(prefix="/api/admin/attendance", tags=["attendance"])


@attendance_router.post("/generate")
async def generate_attendance(
    teacher_name: str = Query(..., description="Teacher name"),
    db: Session = Depends(get_db)
):
    """Generate attendance records for teacher"""
    try:
        teacher_info_repo = TeacherInfoRepository(db)
        timetable = teacher_info_repo.get_timetable_by_teacher_name(teacher_name)
        
        if not timetable:
            raise HTTPException(status_code=404, detail="Расписание преподавателя не найдено")
        
        # Convert JSON to TimetableDto
        from VSUET.fastapi.app.models.pydantic_models.pydantic_models import TimetableDto
        timetable_dto = TimetableDto(**timetable.timetable_json)
        
        attendance_service = AttendanceService(db)
        attendance_service.generate_attendance_from_teacher_timetable(timetable_dto, teacher_name)
        
        return {"message": "Ведомости успешно сгенерированы"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@attendance_router.get("/student/zach")
async def get_student_attendance_by_zach(
    zach_number: str = Query(..., description="Zach number"),
    db: Session = Depends(get_db)
):
    """Get student attendance by zach number"""
    attendance_service = AttendanceService(db)
    attendance = attendance_service.get_student_attendance_by_zach(zach_number)
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    return attendance


@attendance_router.get("/student/name")
async def get_student_attendance_by_name(
    student_name: str = Query(..., description="Student name"),
    db: Session = Depends(get_db)
):
    """Get student attendance by name"""
    attendance_service = AttendanceService(db)
    attendance = attendance_service.get_student_attendance_by_name(student_name)
    
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    
    return attendance


@attendance_router.get("/teacher/group")
async def get_group_attendance(
    group_name: str = Query(..., description="Group name"),
    subject_name: str = Query(..., description="Subject name"),
    db: Session = Depends(get_db)
):
    """Get group attendance for specific subject"""
    attendance_service = AttendanceService(db)
    attendance = attendance_service.get_group_attendance(group_name, subject_name)
    return attendance


@attendance_router.get("/teacher/lesson")
async def get_lesson_attendance(
    group_name: str = Query(..., description="Group name"),
    subject_name: str = Query(..., description="Subject name"),
    date: str = Query(..., description="Date"),
    time: str = Query(..., description="Time"),
    db: Session = Depends(get_db)
):
    """Get lesson attendance"""
    attendance_service = AttendanceService(db)
    attendance = attendance_service.get_lesson_attendance(group_name, subject_name, date, time)
    return attendance
