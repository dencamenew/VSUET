package ru.vsuetapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attendance_table")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teacherName;

    private String period;

    private String subjectType;

    private String subjectName;

    private String groupName;

    @Column(columnDefinition = "jsonb")
    private String reportJson; // хранится JSON со студентами и посещаемостью
}

