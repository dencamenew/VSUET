package ru.practice.teststation.model;

import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import java.util.Map;

@Entity
@Table(name = "teacher_timetable")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherTimetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher", nullable = false, unique = true, length = 255)
    private String teacher;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "timetable", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> timetable;
}