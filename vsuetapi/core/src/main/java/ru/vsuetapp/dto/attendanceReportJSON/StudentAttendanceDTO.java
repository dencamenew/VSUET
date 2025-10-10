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

    // Ключ — дата (строкой, например "2024-03-15")
    // Значение — статус посещаемости
    private Map<String, AttendanceStatus> attendance;
}

