package ru.practice.teststation.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Data;
import ru.practice.teststation.model.enums.QrStatus;



@Data
@Entity
@Table(name = "qr")
public class QRCode {
    @Id
    private String qrUUID = UUID.randomUUID().toString();
    private String token = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    @Enumerated(EnumType.STRING) 
    private QrStatus status = QrStatus.PENDING; // pending, scanned, expired
    
    // передаётся с фронта учителя
    private String subject;
    private LocalTime time;
    private LocalDate date; 
    private String teacher;
    
    // Кто отсканировал 
    private String student;
}