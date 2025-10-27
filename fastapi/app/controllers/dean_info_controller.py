from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.config.database import get_db
from app.services.dean_info_service import DeanInfoService

dean_info_router = APIRouter(prefix="/api/dean", tags=["dean"])


@dean_info_router.get("/{dean_id}")
async def get_dean_info(
    dean_id: int,
    db: Session = Depends(get_db)
):
    """Get dean information by ID"""
    dean_service = DeanInfoService(db)
    dean = dean_service.get_dean_info(dean_id)
    
    if not dean:
        raise HTTPException(status_code=404, detail="Dean not found")
    
    return dean


@dean_info_router.get("/faculty/{faculty_id}")
async def get_deans_by_faculty(
    faculty_id: int,
    db: Session = Depends(get_db)
):
    """Get all deans by faculty ID"""
    dean_service = DeanInfoService(db)
    deans = dean_service.get_deans_by_faculty(faculty_id)
    return deans


@dean_info_router.get("/")
async def get_all_deans(db: Session = Depends(get_db)):
    """Get all deans"""
    dean_service = DeanInfoService(db)
    deans = dean_service.get_all_deans()
    return deans
