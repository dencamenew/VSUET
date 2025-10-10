package ru.vsuetapp.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "attendance_table")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teacherName;

    private String period;

    private String subjectType;

    private String subjectName;

    private String groupName;

    private String day;

    private String time;

    // Храним JSON как строку, но в БД колонка типа jsonb
    @Type(JsonBinaryType.class)
    @Column(name = "report_json", columnDefinition = "jsonb")
    private String reportJson; // хранится JSON со студентами и посещаемостью в виде строки
}
