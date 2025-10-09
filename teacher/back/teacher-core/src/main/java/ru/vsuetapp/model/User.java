package ru.vsuetapp.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.vsuetapp.model.enums.Role;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwd;

    @Column(nullable = false)
    private Role role;

    // ----- Внешние ключи -----

    @OneToOne
    @JoinColumn(name = "dean_info_id")
    private DeanInfo deanInfo;

    @OneToOne
    @JoinColumn(name = "student_info_id")
    private StudentInfo studentInfo;

    // @OneToOne
    // @JoinColumn(name = "teacher_info_id")
    // private TeacherInfo teacherInfo;


    // ----- Метаданные -----
    @Column(name = "created_at", nullable = false)
    final LocalDateTime createdAt = LocalDateTime.now();
}