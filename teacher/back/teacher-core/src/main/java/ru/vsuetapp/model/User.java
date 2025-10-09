package ru.vsuetapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import lombok.*;
import ru.vsuetapp.model.enums.RoleForSession;

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
    private RoleForSession role;

    // ----- Внешние ключи -----

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dean_info_id", referencedColumnName = "id")
    private DeanInfo deanInfo;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "teacher_info_id", referencedColumnName = "id")
    // private TeacherInfo teacherInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_info_id", referencedColumnName = "id")
    private StudentInfo studentInfo;

    // ----- Метаданные -----
    @Column(name = "created_at", nullable = false)
    final LocalDateTime createdAt = LocalDateTime.now();
}