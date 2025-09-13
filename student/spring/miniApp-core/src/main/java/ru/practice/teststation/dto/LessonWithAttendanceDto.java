package ru.practice.teststation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonWithAttendanceDto {
    private Long id;
    private String time;
    private String subject;
    private String typeSubject;
    private String teacher;
    private String audience;
    private Boolean turnout;
    private String comment;
    private String groupName;
}