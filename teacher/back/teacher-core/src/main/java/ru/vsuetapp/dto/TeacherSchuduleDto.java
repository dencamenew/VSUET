package ru.vsuetapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherSchuduleDto {
    private Long id;
    private LocalTime time;
    private LocalDate date;
    private String subject;
    private String groupName;
    private String typeSubject;
    private String audience;
}