package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.practice.teststation.response.QRGenerationResponse;
import ru.practice.teststation.model.QRCode;
import ru.practice.teststation.repository.QRCodeRepository;
import ru.practice.teststation.requests.QRGenerationRequest;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRService {

    private final QRCodeRepository qrCodeRepository;


    @Transactional
    public QRGenerationResponse generateQRCode(QRGenerationRequest qrGenerationRequest) {
        // Генерация уникальных идентификаторов
        String qrUUID = UUID.randomUUID().toString();
        String token = generateSecureToken();
        
        // Расчет времени истечения (2 минут)
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(2);
        
        // Формирование URL для сканирования
        String qrUrl = "https://localhost:8080/api/qr/scan?qr_id=" + qrUUID + "&token=" + token;
        
        // Сохранение в базу данных
        QRCode qrCode = new QRCode();
        qrCode.setQrUUID(qrUUID);
        qrCode.setToken(token);
        qrCode.setStatus("pending");
        qrCode.setExpiresAt(expiresAt);
        qrCode.setCreatedAt(LocalDateTime.now());

        qrCode.setSubject(qrGenerationRequest.getSubject());
        qrCode.setClassTime(qrGenerationRequest.getClassTime());
        qrCode.setClassDate(qrGenerationRequest.getClassDate());
        qrCode.setTeacherName(qrGenerationRequest.getTeacherName());
        qrCode.setGroupName(qrGenerationRequest.getGroupName());
        

        
        qrCodeRepository.save(qrCode);
        
        // Формирование ответа
        return new QRGenerationResponse(
            qrUUID,
            qrUrl,
            expiresAt,
            120 
        );
    }


    private String generateSecureToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}