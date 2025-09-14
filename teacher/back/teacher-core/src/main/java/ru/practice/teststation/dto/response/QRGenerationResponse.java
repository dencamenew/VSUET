package ru.practice.teststation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRGenerationResponse {
    private String qrUUID;
    private String token;
    private String qrUrl;
}