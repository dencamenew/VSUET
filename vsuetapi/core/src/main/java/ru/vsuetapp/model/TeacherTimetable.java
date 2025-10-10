package ru.vsuetapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "teacher_timetable")
public class TeacherTimetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "timetable")
    private TeacherInfo teacherInfo;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String timetableJson;
}