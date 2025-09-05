package ru.practice.teststation.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRGenerationRequest {
    private String subject;
    private String classTime; // как будет на фронте передаваться хз поэтому пока string 
    private String classDate; // как будет на фронте передаваться хз поэтому пока string
    private String groupName;
    private String teacherName; // привязка к преподавателю
}