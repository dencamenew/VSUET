from pydantic import BaseModel, Field
from typing import Optional
from datetime import date as date_type



'''запрос для ручки /api/attendance/teacher/mark-to-one'''
class MarkAttendanceRequest(BaseModel):
    teacher_first_name: str = Field(..., description="Имя преподавателя")
    teacher_last_name: str = Field(..., description="Фамилия преподавателя")
    group_name: str = Field(..., description="Название группы")
    subject_name: str = Field(..., description="Название предмета")
    date: str = Field(..., description="Дата в формате строки")
    zach: str = Field(..., description="Номер зачетной книжки студента")
    status: bool = Field(..., description="Статус посещения (True/False)")

    class Config:
        schema_extra = {
            "example": {
                "teacher_first_name": "Иван",
                "teacher_last_name": "Петров",
                "group_name": "ИТ-21",
                "subject_name": "Математика",
                "date": "2024-01-15",
                "zach": "123456",
                "status": True
            }
        }