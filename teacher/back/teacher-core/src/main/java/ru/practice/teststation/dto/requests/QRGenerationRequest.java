package ru.practice.teststation.dto.requests;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRGenerationRequest {
    private String subject;
    private LocalTime time;
    private LocalDate date; 
    private String teacher;
}