package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "timetable")
@Getter
@Setter
public class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "timetable")
    @JdbcTypeCode(SqlTypes.JSON)
    private String timetableData;
}
