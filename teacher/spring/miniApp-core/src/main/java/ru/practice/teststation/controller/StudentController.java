package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.*;
import ru.practice.teststation.service.StudentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/timetable/{zachNumber}")
    public TimetableResponseDto getTimetable(@PathVariable String zachNumber) {
        return studentService.getTimetable(zachNumber);
    }

    @GetMapping("/rating/{zachNumber}")
    public RatingResponseDto getRatings(@PathVariable String zachNumber) {
        return studentService.getRatings(zachNumber);
    }
}