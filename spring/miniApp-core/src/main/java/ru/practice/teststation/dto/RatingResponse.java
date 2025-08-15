package ru.practice.teststation.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RatingResponse {
    private String zachNumber;
    private String groupName;
    private List<RatingDto> ratings;
}