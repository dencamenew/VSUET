package ru.practice.teststation.requests;

import lombok.Data;

@Data
public class QRGenerationRequest {
    private String subject;
    private String classTime; // как будет на фронте передаваться хз поэтому пока string 
    private String classDate; // как будет на фронте передаваться хз поэтому пока string
    private String groupName;
    private String teacherName; // привязка к преподавателю
}