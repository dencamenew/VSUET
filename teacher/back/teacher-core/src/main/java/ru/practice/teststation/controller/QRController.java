package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import ru.practice.teststation.dto.requests.QRGenerationRequest;
import ru.practice.teststation.dto.response.QRGenerationResponse;
import ru.practice.teststation.service.QRService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qr")
public class QRController {

    private final QRService qrService;

    @PostMapping("/generate")
    public ResponseEntity<QRGenerationResponse> generateQR(@RequestBody QRGenerationRequest qrGenerationRequest) {
        QRGenerationResponse response = qrService.generateQRCode(qrGenerationRequest);
        return ResponseEntity.ok(response);
    }
}