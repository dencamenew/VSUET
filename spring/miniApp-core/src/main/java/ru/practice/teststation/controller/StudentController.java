package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.StudentInfoDto;
import ru.practice.teststation.service.StudentService;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/info/{zachNumber}")
    public ResponseEntity<StudentInfoDto> getStudentInfo(@PathVariable String zachNumber) {
        return ResponseEntity.ok(studentService.getStudentInfo(zachNumber));
    }
}