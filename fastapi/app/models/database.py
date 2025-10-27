from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.models.enums import Role, AttendanceStatus

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    passwd = Column(String, nullable=False)
    role = Column(SQLEnum(Role), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    dean_info_id = Column(Integer, ForeignKey("dean_info.id"))
    student_info_id = Column(Integer, ForeignKey("student_info.id"))
    teacher_info_id = Column(Integer, ForeignKey("teacher_info.id"))

    dean_info = relationship("DeanInfo", back_populates="user")
    student_info = relationship("StudentInfo", back_populates="user")
    teacher_info = relationship("TeacherInfo", back_populates="user")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    # Relationships
    groups = relationship("Groups", back_populates="faculty")
    dean_infos = relationship("DeanInfo", back_populates="faculty")


class Groups(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, unique=True, nullable=False)

    # Foreign keys
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    timetable_id = Column(Integer, ForeignKey("group_timetable.id"))

    # Relationships
    faculty = relationship("Faculty", back_populates="groups")
    timetable = relationship("GroupTimetable", back_populates="group")
    student_infos = relationship("StudentInfo", back_populates="group")


class StudentInfo(Base):
    __tablename__ = "student_info"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, unique=True, nullable=False)
    zach_number = Column(String, unique=True, nullable=False)

    # Foreign keys
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    # Relationships
    group = relationship("Groups", back_populates="student_infos")
    user = relationship("User", back_populates="student_info")


class TeacherInfo(Base):
    __tablename__ = "teacher_info"

    id = Column(Integer, primary_key=True, index=True)
    teacher_name = Column(String, unique=True, nullable=False)

    # Foreign keys
    timetable_id = Column(Integer, ForeignKey("teacher_timetable.id"))

    # Relationships
    timetable = relationship("TeacherTimetable", back_populates="teacher")
    user = relationship("User", back_populates="teacher_info")


class DeanInfo(Base):
    __tablename__ = "dean_info"

    id = Column(Integer, primary_key=True, index=True)
    dean_name = Column(String, unique=True, nullable=False)

    # Foreign keys
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)

    # Relationships
    faculty = relationship("Faculty", back_populates="dean_infos")
    user = relationship("User", back_populates="dean_info")


class Attendance(Base):
    __tablename__ = "attendance_table"

    id = Column(Integer, primary_key=True, index=True)
    teacher_name = Column(String)
    period = Column(String)
    subject_type = Column(String)
    subject_name = Column(String)
    group_name = Column(String)
    day = Column(String)
    time = Column(String)
    report_json = Column(JSONB)


class Rating(Base):
    __tablename__ = "rating_table"

    id = Column(Integer, primary_key=True, index=True)
    teacher_name = Column(String)
    period = Column(String)
    subject_type = Column(String)
    subject_name = Column(String)
    group_name = Column(String)
    report_json = Column(JSONB)


class GroupTimetable(Base):
    __tablename__ = "group_timetable"

    id = Column(Integer, primary_key=True, index=True)
    timetable_json = Column(JSONB)

    # Relationships
    group = relationship("Groups", back_populates="timetable")


class TeacherTimetable(Base):
    __tablename__ = "teacher_timetable"

    id = Column(Integer, primary_key=True, index=True)
    timetable_json = Column(JSONB)

    # Relationships
    teacher = relationship("TeacherInfo", back_populates="timetable")



