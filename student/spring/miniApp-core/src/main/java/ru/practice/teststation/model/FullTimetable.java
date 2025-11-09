package ru.practice.teststation.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "full_timetable")
public class FullTimetable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "group_name", length = 100)
    private String groupName;
    
    @Column(name = "zach_number", nullable = false, length = 255)
    private String zachNumber;
    
    @Column(nullable = false)
    private LocalTime time;
    
    @Column(nullable = false, length = 255)
    private String subject;
    
    @Column(name = "type_subject", length = 20)
    private String typeSubject;
    
    @Column(length = 255)
    private String teacher;
    
    @Column(length = 30)
    private String audience;
    
    private Boolean turnout = false;
    
    @Column(length = 255)
    private String comment;

    // Конструкторы
    public FullTimetable() {}

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    
    public String getZachNumber() { return zachNumber; }
    public void setZachNumber(String zachNumber) { this.zachNumber = zachNumber; }
    
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getTypeSubject() { return typeSubject; }
    public void setTypeSubject(String typeSubject) { this.typeSubject = typeSubject; }
    
    public String getTeacher() { return teacher; }
    public void setTeacher(String teacher) { this.teacher = teacher; }
    
    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
    
    public Boolean getTurnout() { return turnout; }
    public void setTurnout(Boolean turnout) { this.turnout = turnout; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}