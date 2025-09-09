package ru.practice.teststation.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonWithAttendanceDto {
    private Long id;
    private String date;
    private String time;
    private String subject;
    private String typeSubject;
    private String teacher;
    private String audience;
    private Boolean turnout;
    private String comment;
}