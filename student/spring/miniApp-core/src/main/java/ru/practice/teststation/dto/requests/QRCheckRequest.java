package ru.practice.teststation.dto.requests;

import lombok.Data;

@Data
public class QRCheckRequest {
    private String qrUUID;
    private String token;
}