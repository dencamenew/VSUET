package ru.practice.teststation.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "timetable_with_zach",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"zach_number", "week_type", "week_day", "time"})
        })
public class TimetableWithZach {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zach_number", nullable = false)
    private String zachNumber;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(name = "week_type", nullable = false)
    private String weekType;

    @Column(name = "week_day", nullable = false)
    private String weekDay;

    @Column(name = "time", nullable = false)
    private LocalTime time;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "audience")
    private String audience;

    @Column(name = "teacher")
    private String teacher;
}