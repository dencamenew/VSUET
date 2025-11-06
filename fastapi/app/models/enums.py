from enum import Enum


class Role(str, Enum):
    ADMIN = "ADMIN"
    DEAN = "DEAN"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"


class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    SICK = "SICK"
    EXCUSED = "EXCUSED"
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"



