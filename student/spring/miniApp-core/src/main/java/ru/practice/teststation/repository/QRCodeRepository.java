package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.practice.teststation.model.QRCode;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    
    Optional<QRCode> findByQrUUIDAndToken(String qrUUID, String token);
    
    Optional<QRCode> findByQrUUID(String qrUUID);
    
    Optional<QRCode> findByToken(String token);
    
    @Query("SELECT q FROM QRCode q WHERE q.qrUUID = :qrUUID AND q.token = :token AND q.status = 'PENDING'")
    Optional<QRCode> findValidQRCode(@Param("qrUUID") String qrUUID, @Param("token") String token);
    
    @Query("SELECT q FROM QRCode q WHERE q.date = :date AND q.time = :time AND q.teacher = :teacher AND q.subject = :subject")
    Optional<QRCode> findByDateTimeTeacherSubject(
        @Param("date") LocalDate date,
        @Param("time") LocalTime time,
        @Param("teacher") String teacher,
        @Param("subject") String subject
    );
    
    boolean existsByQrUUID(String qrUUID);
    
    boolean existsByToken(String token);
}