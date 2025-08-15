package ru.practice.teststation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInfoDto {
    private String zachNumber;
    private String groupName;
    private List<RatingDto> ratings;
    private JsonNode timetable;
}



