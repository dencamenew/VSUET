package ru.practice.teststation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableWithAttendanceDto {
    private String zachNumber;
    private LocalDate date;
    private List<LessonWithAttendanceDto> timetable;
}