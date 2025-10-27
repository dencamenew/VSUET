package ru.vsuetapp.dto.attendanceReportJSON;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.vsuetapp.model.enums.AttendanceStatus;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceDTO {
    private String studentId;
    private AttendanceStatus attendance;
}


