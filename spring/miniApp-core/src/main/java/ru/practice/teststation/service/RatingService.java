package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.practice.teststation.dto.RatingDto;
import ru.practice.teststation.dto.RatingResponse;
import ru.practice.teststation.exception.StudentNotFoundException;
import ru.practice.teststation.model.Rating;
import ru.practice.teststation.model.Zach;
import ru.practice.teststation.repository.ZachRepository;
import ru.practice.teststation.repository.RatingRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final ZachRepository zachRepository;
    private final RatingRepository ratingRepository;

    public RatingResponse getRatings(String zachNumber) {
        Zach zach = zachRepository.findByZachNumber(zachNumber)
                .orElseThrow(() -> new StudentNotFoundException("Студент не найден"));

        List<Rating> ratings = ratingRepository.findByZachNumber(zachNumber);

        return RatingResponse.builder()
                .zachNumber(zach.getZachNumber())
                .groupName(zach.getGroupName())
                .ratings(convertToRatingDtos(ratings))
                .build();
    }

    private List<RatingDto> convertToRatingDtos(List<Rating> ratings) {
        return ratings.stream()
                .map(r -> RatingDto.builder()
                        .subject(r.getSubject())
                        .ratings(r.getRatings())
                        .build())
                .collect(Collectors.toList());
    }
}