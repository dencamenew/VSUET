package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.Data;



@Data
@Entity
@Table(name = "teacher_info")
public class TeacherInfo {
    private String teacherName;
    private String teacherPassword;
}
