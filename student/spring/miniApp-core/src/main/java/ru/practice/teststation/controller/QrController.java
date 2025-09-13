package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.requests.QRCheckRequest;
import ru.practice.teststation.dto.response.QRCheckResponse;
import ru.practice.teststation.service.StudentQrService;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrController {

    private final StudentQrService studentQrService;

    @PostMapping("/qrcheck")
    public ResponseEntity<QRCheckResponse> checkQrCode(
            @RequestBody QRCheckRequest qrCheckRequest,
            @RequestHeader("X-Student-Number") String zachNumber) {
        
        QRCheckResponse response = studentQrService.checkQRCode(qrCheckRequest, zachNumber);
        
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{qrUUID}")
    public ResponseEntity<String> getQrStatus(@PathVariable String qrUUID) {
        return ResponseEntity.ok("QR status endpoint");
    }
}