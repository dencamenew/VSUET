package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import ru.practice.teststation.dto.TeacherSchuduleDto;
import ru.practice.teststation.service.TeacherSchuduleServise;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schudule")
public class SchuduleController {

    private final TeacherSchuduleServise teacherSchuduleServise;


    @GetMapping("/teacher")
    public ResponseEntity<?> getSchudule(@RequestParam String teacher) {
        List<TeacherSchuduleDto> schedule = teacherSchuduleServise.getTeacherSchudule(teacher);

        Map<String, Object> response = new HashMap<>();
        response.put("teacher", teacher);
        response.put("schedule", schedule);
    
        return ResponseEntity.ok(response);
    }
    
}
