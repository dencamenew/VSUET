package ru.practice.teststation.dto;

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
    private LocalTime time;    // 3-й параметр
    private LocalDate date;    // 4-й параметр  
    private String subject;
    private String groupName;
}