package ru.practice.teststation.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRGenerationRequest {
    private String subject;
    private String startLessonTime;
    private String endLessonTime;
    private String classDate; 
    private String groupName;
    private String teacherName;
}