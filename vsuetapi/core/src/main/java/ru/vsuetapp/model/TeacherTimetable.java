package ru.vsuetapp.model;

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

    @OneToOne
    @JoinColumn(name = "teacher_info_id", referencedColumnName = "id")
    private TeacherInfo teacherInfo;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String timetableJson;
}
