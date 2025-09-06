package ru.practice.teststation.model;

import java.io.Serializable;

import jakarta.persistence.*;
import lombok.Data;



@Data
@Entity
@Table(name = "teachers_info")
public class TeacherInfo implements Serializable {
    private static final long serialVersionUID = 1L; 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String password;
}
