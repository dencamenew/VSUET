package ru.vsuetapp.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "rating_table")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teacherName;
    private String period;
    private String subjectType;
    private String subjectName;
    private String groupName;

    @Type(JsonBinaryType.class)
    @Column(name = "report_json", columnDefinition = "jsonb")
    private String reportJson; // JSON вида {"students":[{"studentId":1,"rating":[-,-,-,-,-]}]}
}
