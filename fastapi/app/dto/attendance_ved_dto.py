from pydantic import BaseModel, Field
from typing import Dict
from datetime import date

class AttendanceDTO(BaseModel):
    attendance: Dict[date, bool] = Field(..., description="Посещаемость по датам")
    student_id: str = Field(..., description="номер зачетки")

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat()
        }