package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.practice.teststation.dto.requests.QRGenerationRequest;
import ru.practice.teststation.dto.response.QRGenerationResponse;
import ru.practice.teststation.model.QRCode;
import ru.practice.teststation.model.enums.QrStatus;
import ru.practice.teststation.repository.QRCodeRepository;


@Service
@RequiredArgsConstructor
public class QRService {

    private final QRCodeRepository qrCodeRepository;


    @Transactional
    public QRGenerationResponse generateQRCode(QRGenerationRequest qrGenerationRequest) {
        // Сохранение в базу данных
        QRCode qrCode = new QRCode();
        qrCode.setSubject(qrGenerationRequest.getSubject());
        qrCode.setTime(qrGenerationRequest.getTime());
        qrCode.setDate(qrGenerationRequest.getDate());
        qrCode.setTeacher(qrGenerationRequest.getTeacher());
        qrCode.setStatus(QrStatus.PENDING);


        qrCodeRepository.save(qrCode);

        String qrUrl = "https://studentback.cloudpub.ru/api/qr/scan?qr_id=" + qrCode.getQrUUID() + "&token=" + qrCode.getToken();
        
        // Формирование ответа
        return new QRGenerationResponse(
            qrUrl
        );
    }
}