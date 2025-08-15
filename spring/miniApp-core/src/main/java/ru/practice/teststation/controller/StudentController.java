package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.RatingResponse;
import ru.practice.teststation.dto.TimetableResponse;
import ru.practice.teststation.service.RatingService;
import ru.practice.teststation.service.TimetableService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class StudentController {

    private final TimetableService timetableService;
    private final RatingService ratingService;

    @GetMapping("/timetable/{zachNumber}")
    public TimetableResponse getTimetable(@PathVariable String zachNumber) {
        return timetableService.getTimetable(zachNumber);
    }

    @GetMapping("/rating/{zachNumber}")
    public RatingResponse getRatings(@PathVariable String zachNumber) {
        return ratingService.getRatings(zachNumber);
    }
}