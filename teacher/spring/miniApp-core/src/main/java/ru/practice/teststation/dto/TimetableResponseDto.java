package ru.practice.teststation.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimetableResponseDto {
    private String zachNumber;
    private String groupName;
    private JsonNode timetable;
}