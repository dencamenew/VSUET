package ru.practice.teststation.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


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
    private String classTime; // как будет на фронте передаваться хз поэтому пока string 
    private String classDate; // как будет на фронте передаваться хз поэтому пока string
    private String groupName;
    private String teacherName; // привязка к преподавателю
    
    // Кто отсканировал 
    private String studentWhoScan;
    
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}