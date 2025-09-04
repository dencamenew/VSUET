package ru.practice.teststation.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRGenerationResponse {
    private String qr_uuid;
    private String qr_url;
    private LocalDateTime expires_at;
    private Integer expires_in; // seconds
}