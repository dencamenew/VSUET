package ru.vsuetapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private Long id;
    private String studentId;
    private LocalTime time;
    private LocalDate date;
    private Boolean turnout;
}