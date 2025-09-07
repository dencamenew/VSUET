package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.practice.teststation.dto.requests.QRGenerationRequest;
import ru.practice.teststation.dto.response.QRGenerationResponse;
import ru.practice.teststation.model.QRCode;
import ru.practice.teststation.repository.QRCodeRepository;

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
        
        
        // Формирование URL для сканирования
        String qrUrl = "https://localhost:8081/api/qr/scan?qr_id=" + qrUUID + "&token=" + token;
        
        // Сохранение в базу данных
        QRCode qrCode = new QRCode();
        qrCode.setQrUUID(qrUUID);
        qrCode.setToken(token);
        qrCode.setStatus("pending");

        qrCode.setSubject(qrGenerationRequest.getSubject());
        qrCode.setStartLessonTime(qrGenerationRequest.getStartLessonTime());
        qrCode.setEndLessonTime(qrGenerationRequest.getEndLessonTime());
        qrCode.setClassDate(qrGenerationRequest.getClassDate());
        qrCode.setTeacherName(qrGenerationRequest.getTeacherName());
        qrCode.setGroupName(qrGenerationRequest.getGroupName());
        

        
        qrCodeRepository.save(qrCode);
        
        // Формирование ответа
        return new QRGenerationResponse(
            qrUUID,
            qrUrl
        );
    }


    private String generateSecureToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}