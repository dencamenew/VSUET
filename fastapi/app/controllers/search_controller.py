from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.config.database import get_db
from app.services.search_service import SearchService

search_router = APIRouter(prefix="/api/search", tags=["search"])


@search_router.get("/students")
async def search_students_by_name(
    name: str = Query(..., description="Student name"),
    db: Session = Depends(get_db)
):
    """Search students by name"""
    search_service = SearchService(db)
    students = search_service.search_students_by_name(name)
    return students


@search_router.get("/teachers")
async def search_teachers_by_name(
    name: str = Query(..., description="Teacher name"),
    db: Session = Depends(get_db)
):
    """Search teachers by name"""
    search_service = SearchService(db)
    teachers = search_service.search_teachers_by_name(name)
    return teachers


@search_router.get("/groups")
async def search_groups_by_name(
    name: str = Query(..., description="Group name"),
    db: Session = Depends(get_db)
):
    """Search groups by name"""
    search_service = SearchService(db)
    groups = search_service.search_groups_by_name(name)
    return groups
