package ru.practice.teststation.model;


import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
@Table(name = "full_timetable", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"date", "zach_number", "time"}))
public class FullTimetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "group_name", nullable = false)
    private String groupName;
    
    @Column(name = "zach_number", nullable = false)
    private String studentId;
    
    @Column(name = "time", nullable = false)
    private LocalTime time;
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "teacher")
    private String teacher;
    
    @Column(name = "turnout")
    private Boolean turnout = false;
    
    @Column(name = "comment")
    private String comment;
}