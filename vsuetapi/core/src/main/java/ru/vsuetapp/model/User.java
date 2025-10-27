package ru.vsuetapp.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import ru.vsuetapp.model.enums.Role;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwd;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dean_info_id")
    private DeanInfo deanInfo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_info_id")
    private StudentInfo studentInfo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_info_id")
    private TeacherInfo teacherInfo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
