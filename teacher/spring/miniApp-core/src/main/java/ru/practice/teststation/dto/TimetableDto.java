package ru.practice.teststation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableDto {
    private Map<String, Map<String, Map<String, String>>> numerator;
    private Map<String, Map<String, Map<String, String>>> denominator;

    public TimetableDto(JsonNode jsonTimetable) {
    }
}
