package ru.practice.teststation.model;

import lombok.Data;
import ru.practice.teststation.model.enums.QrStatus;

import jakarta.persistence.*; 
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "qr")
public class QRCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "qruuid", unique = true, nullable = false)
    private String qrUUID = UUID.randomUUID().toString();
    
    @Column(name = "token", unique = true, nullable = false)
    private String token = UUID.randomUUID().toString();
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "time", nullable = false)
    private LocalTime time;
    
    @Column(name = "teacher", nullable = false)
    private String teacher;
    
    @Column(name = "student")
    private String student;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QrStatus status;
    
    @PrePersist
    protected void onCreate() {
        if (qrUUID == null) {
            qrUUID = UUID.randomUUID().toString();
        }
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = QrStatus.PENDING;
        }
    }
}