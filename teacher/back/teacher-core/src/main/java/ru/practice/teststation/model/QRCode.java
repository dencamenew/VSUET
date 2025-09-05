package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.Data;



@Data
@Entity
@Table(name = "qr_codes")
public class QRCode {
    
    @Id
    private String qrUUID;
    
    private String token;
    private String status; // pending, scanned, expired
    

    // передаётся с фронта учителя
    private String subject;
    private String startLessonTime;
    private String endLessonTime;
    private String classDate; 
    private String groupName;
    private String teacherName;
    
    // Кто отсканировал 
    private String studentWhoScan;
}