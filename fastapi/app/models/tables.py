# database.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

Base = declarative_base()


class Groups(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String(255), unique=True, nullable=False)

    # Relationships
    student_infos = relationship("StudentInfo", back_populates="group")
    group_timetables = relationship("GroupTimetable", back_populates="group")
    attendances = relationship("Attendance", back_populates="group")
    ratings = relationship("Rating", back_populates="group")


class GroupTimetable(Base):
    __tablename__ = "group_timetable"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    timetable = Column(JSONB, nullable=False)

    # Relationships
    group = relationship("Groups", back_populates="group_timetables")


class StudentInfo(Base):
    __tablename__ = "student_info"

    id = Column(Integer, primary_key=True, index=True)
    zach_number = Column(String(255), unique=True, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"))

    # Relationships
    group = relationship("Groups", back_populates="student_infos")
    users = relationship("User", back_populates="student_info")


class TeacherTimetable(Base):
    __tablename__ = "teacher_timetable"

    id = Column(Integer, primary_key=True, index=True)
    timetable = Column(JSONB, nullable=False)

    # Relationships
    teacher_infos = relationship("TeacherInfo", back_populates="timetable")


class TeacherInfo(Base):
    __tablename__ = "teacher_info"

    id = Column(Integer, primary_key=True, index=True)
    groups_subjects = Column(JSONB)
    timetable_id = Column(Integer, ForeignKey("teacher_timetable.id"))

    # Relationships
    timetable = relationship("TeacherTimetable", back_populates="teacher_infos")
    users = relationship("User", back_populates="teacher_info")
    attendances = relationship("Attendance", back_populates="teacher")
    ratings = relationship("Rating", back_populates="teacher")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    max_id = Column(String(255))
    role = Column(String(50), nullable=False)
    teacher_info_id = Column(Integer, ForeignKey("teacher_info.id"))
    student_info_id = Column(Integer, ForeignKey("student_info.id"))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    teacher_info = relationship("TeacherInfo", back_populates="users")
    student_info = relationship("StudentInfo", back_populates="users")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String(255), nullable=False)
    semestr = Column(String(50))
    teacher_id = Column(Integer, ForeignKey("teacher_info.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    attendance_json = Column(JSONB)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    teacher = relationship("TeacherInfo", back_populates="attendances")
    group = relationship("Groups", back_populates="attendances")


class Rating(Base):
    __tablename__ = "rating"

    id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String(255), nullable=False)
    subject_type = Column(String(255))
    semestr = Column(String(50))
    teacher_id = Column(Integer, ForeignKey("teacher_info.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    rating_json = Column(JSONB)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    teacher = relationship("TeacherInfo", back_populates="ratings")
    group = relationship("Groups", back_populates="ratings")