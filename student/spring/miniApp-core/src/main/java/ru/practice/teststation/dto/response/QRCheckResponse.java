package ru.practice.teststation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCheckResponse {
    private boolean valid;
    private String message;
    private String subject;
    private String date;
    private String time;
    private String teacher;
    private String groupName;
    
    public QRCheckResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }
}