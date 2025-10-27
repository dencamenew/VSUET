from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pydantic_models import (
    FacultyCreate, FacultyResponse, UserResponse, TimetableDto,
    GroupTimetable, TeacherTimetable
)
from app.services.admin_service import AdminService

admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


@admin_router.post("/faculty", response_model=FacultyResponse)
async def create_faculty(
    faculty_name: str = Query(..., description="Faculty name"),
    db: Session = Depends(get_db)
):
    """Create a new faculty"""
    try:
        admin_service = AdminService(db)
        faculty = admin_service.create_faculty(faculty_name)
        return faculty
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.delete("/faculty/{faculty_id}")
async def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    """Delete faculty by ID"""
    try:
        admin_service = AdminService(db)
        admin_service.delete_faculty_by_id(faculty_id)
        return {"message": "Факультет успешно удалён"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.post("/users/dean", response_model=UserResponse)
async def create_dean_user(
    username: str = Query(..., description="Username"),
    password: str = Query(..., description="Password"),
    dean_name: str = Query(..., description="Dean name"),
    faculty_id: int = Query(..., description="Faculty ID"),
    db: Session = Depends(get_db)
):
    """Create a new dean user"""
    try:
        admin_service = AdminService(db)
        user = admin_service.create_dean_user(username, password, dean_name, faculty_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.post("/users/student", response_model=UserResponse)
async def create_student_user(
    username: str = Query(..., description="Username"),
    password: str = Query(..., description="Password"),
    student_name: str = Query(..., description="Student name"),
    group_id: int = Query(..., description="Group ID"),
    zach_number: str = Query(..., description="Zach number"),
    db: Session = Depends(get_db)
):
    """Create a new student user"""
    try:
        admin_service = AdminService(db)
        user = admin_service.create_student_user(username, password, student_name, group_id, zach_number)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.post("/users/teacher", response_model=UserResponse)
async def create_teacher_user(
    username: str = Query(..., description="Username"),
    password: str = Query(..., description="Password"),
    teacher_name: str = Query(..., description="Teacher name"),
    db: Session = Depends(get_db)
):
    """Create a new teacher user"""
    try:
        admin_service = AdminService(db)
        user = admin_service.create_teacher_user(username, password, teacher_name)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.post("/users/admin", response_model=UserResponse)
async def create_admin_user(
    username: str = Query(..., description="Username"),
    password: str = Query(..., description="Password"),
    db: Session = Depends(get_db)
):
    """Create a new admin user"""
    try:
        admin_service = AdminService(db)
        user = admin_service.create_admin_user(username, password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.delete("/users/dean/{user_id}")
async def delete_dean_user(user_id: int, db: Session = Depends(get_db)):
    """Delete dean user"""
    try:
        admin_service = AdminService(db)
        admin_service.delete_dean_user(user_id)
        return {"message": "Декан и его информация успешно удалены"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.delete("/users/student/{user_id}")
async def delete_student_user(user_id: int, db: Session = Depends(get_db)):
    """Delete student user"""
    try:
        admin_service = AdminService(db)
        admin_service.delete_student_user(user_id)
        return {"message": "Студент и его информация успешно удалены"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.delete("/users/teacher/{user_id}")
async def delete_teacher_user(user_id: int, db: Session = Depends(get_db)):
    """Delete teacher user"""
    try:
        admin_service = AdminService(db)
        admin_service.delete_teacher_user(user_id)
        return {"message": "Преподаватель и его информация успешно удалены"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.post("/timetable/teacher/{teacher_id}", response_model=TeacherTimetable)
async def create_teacher_timetable(
    teacher_id: int,
    timetable_dto: TimetableDto,
    db: Session = Depends(get_db)
):
    """Create teacher timetable"""
    try:
        admin_service = AdminService(db)
        timetable = admin_service.create_teacher_timetable(teacher_id, timetable_dto)
        return timetable
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.delete("/timetable/teacher/{teacher_id}")
async def delete_teacher_timetable(teacher_id: int, db: Session = Depends(get_db)):
    """Delete teacher timetable"""
    try:
        admin_service = AdminService(db)
        admin_service.delete_teacher_timetable(teacher_id)
        return {"message": "Расписание преподавателя удалено"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.post("/timetable/groups/{group_id}", response_model=GroupTimetable)
async def create_student_timetable(
    group_id: int,
    timetable_dto: TimetableDto,
    db: Session = Depends(get_db)
):
    """Create group timetable"""
    try:
        admin_service = AdminService(db)
        timetable = admin_service.create_student_timetable(group_id, timetable_dto)
        return timetable
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})


@admin_router.delete("/timetable/groups/{group_id}")
async def delete_student_timetable(group_id: int, db: Session = Depends(get_db)):
    """Delete group timetable"""
    try:
        admin_service = AdminService(db)
        admin_service.delete_timetable_by_group_id(group_id)
        return {"message": "Расписание группы удалено"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
