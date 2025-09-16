package ru.practice.teststation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingDto {
    private String subject;
    private String vedType;
    private List<String> ratings;
}