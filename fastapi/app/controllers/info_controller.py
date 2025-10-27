from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.config.database import get_db
from app.services.info_service import InfoService

info_router = APIRouter(prefix="/api/info", tags=["info"])


@info_router.get("/student/{student_id}")
async def get_student_info(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Get student information by ID"""
    info_service = InfoService(db)
    student = info_service.get_student_info(student_id)
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student


@info_router.get("/teacher/{teacher_id}")
async def get_teacher_info(
    teacher_id: int,
    db: Session = Depends(get_db)
):
    """Get teacher information by ID"""
    info_service = InfoService(db)
    teacher = info_service.get_teacher_info(teacher_id)
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    return teacher


@info_router.get("/group/{group_id}")
async def get_group_info(
    group_id: int,
    db: Session = Depends(get_db)
):
    """Get group information by ID"""
    info_service = InfoService(db)
    group = info_service.get_group_info(group_id)
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return group


@info_router.get("/faculty/{faculty_id}")
async def get_faculty_info(
    faculty_id: int,
    db: Session = Depends(get_db)
):
    """Get faculty information by ID"""
    info_service = InfoService(db)
    faculty = info_service.get_faculty_info(faculty_id)
    
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    return faculty


@info_router.get("/faculties")
async def get_all_faculties(db: Session = Depends(get_db)):
    """Get all faculties"""
    info_service = InfoService(db)
    faculties = info_service.get_all_faculties()
    return faculties


@info_router.get("/groups")
async def get_all_groups(db: Session = Depends(get_db)):
    """Get all groups"""
    info_service = InfoService(db)
    groups = info_service.get_all_groups()
    return groups
