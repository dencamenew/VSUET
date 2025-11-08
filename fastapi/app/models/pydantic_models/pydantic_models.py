from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
from app.models.enums import Role, AttendanceStatus
from typing import Union

class MaxIdRequest(BaseModel):
    max_id: str
    
# Base models for database entities
class UserBase(BaseModel):
    username: str
    role: Role


class UserCreate(UserBase):
    passwd: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    dean_info_id: Optional[int] = None
    student_info_id: Optional[int] = None
    teacher_info_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class FacultyBase(BaseModel):
    name: str


class FacultyCreate(FacultyBase):
    pass


class FacultyResponse(FacultyBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class GroupsBase(BaseModel):
    group_name: str


class GroupsCreate(GroupsBase):
    faculty_id: int


class GroupsResponse(GroupsBase):
    id: int
    faculty_id: int
    timetable_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class StudentInfoBase(BaseModel):
    student_name: str
    zach_number: str


class StudentInfoCreate(StudentInfoBase):
    group_id: int


class StudentInfoResponse(StudentInfoBase):
    id: int
    group_id: int

    model_config = ConfigDict(from_attributes=True)

class RatingUpdateRequest(BaseModel):
    zach_number: str
    subject_name: str
    control_point: str
    mark: Union[int, str]

class StudentRatingResponse(BaseModel):
    subject_name: str
    rating: Dict[str, Any]

class GroupRatingResponse(BaseModel):
    group_name: str
    subject_name: str
    ratings: List[Dict[str, Any]]
class TeacherInfoBase(BaseModel):
    teacher_name: str


class TeacherInfoCreate(TeacherInfoBase):
    pass


class TeacherInfoResponse(TeacherInfoBase):
    id: int
    timetable_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class DeanInfoBase(BaseModel):
    dean_name: str


class DeanInfoCreate(DeanInfoBase):
    faculty_id: int


class DeanInfoResponse(DeanInfoBase):
    id: int
    faculty_id: int

    model_config = ConfigDict(from_attributes=True)


class AttendanceBase(BaseModel):
    teacher_name: Optional[str] = None
    period: Optional[str] = None
    subject_type: Optional[str] = None
    subject_name: Optional[str] = None
    group_name: Optional[str] = None
    day: Optional[str] = None
    time: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    report_json: Optional[Dict[str, Any]] = None


class AttendanceResponse(AttendanceBase):
    id: int
    report_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class RatingBase(BaseModel):
    teacher_name: Optional[str] = None
    period: Optional[str] = None
    subject_type: Optional[str] = None
    subject_name: Optional[str] = None
    group_name: Optional[str] = None


class RatingCreate(RatingBase):
    report_json: Optional[Dict[str, Any]] = None


class RatingResponse(RatingBase):
    id: int
    report_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


# Timetable DTOs - ИСПРАВЛЕННАЯ СТРУКТУРА
class LessonInfo(BaseModel):
    type: str
    name: str
    teacherName: str
    classroom: str
    group: str

    model_config = ConfigDict(from_attributes=True)


# УБРАН DaySchedule - данные идут напрямую
class TimetableDto(BaseModel):
    denominator: Optional[Dict[str, Dict[str, LessonInfo]]] = {}
    numerator: Optional[Dict[str, Dict[str, LessonInfo]]] = {}

    model_config = ConfigDict(from_attributes=True)


# DTOs for requests and responses
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    username: str
    role: str
    name: str
    group_name: Optional[str] = None
    faculty_name: Optional[str] = None


# Attendance Report DTOs
class StudentAttendanceDTO(BaseModel):
    student_id: str
    attendance: AttendanceStatus


class AttendanceReportDTO(BaseModel):
    students: List[StudentAttendanceDTO]


# Error response
class ErrorResponse(BaseModel):
    error: str


# Timetable Response Models
class GroupTimetable(BaseModel):
    group_id: int
    timetable: TimetableDto

    model_config = ConfigDict(from_attributes=True)


class TeacherTimetable(BaseModel):
    teacher_id: int
    timetable: TimetableDto

    model_config = ConfigDict(from_attributes=True)