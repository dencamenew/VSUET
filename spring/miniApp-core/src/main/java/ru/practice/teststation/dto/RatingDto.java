package ru.practice.teststation.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RatingDto {
    private String subject;
    private List<String> ratings;
}