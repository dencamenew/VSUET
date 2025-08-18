package ru.practice.teststation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GradebookUpdateDto {
    private String eventType;
    private String studentId;
    private String subject;
    private String newGrade;
    private String oldGrade;
    private String status;
    private String date;
}