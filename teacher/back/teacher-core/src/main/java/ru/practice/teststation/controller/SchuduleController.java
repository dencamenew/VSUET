package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.TeacherSchuduleDto;
import ru.practice.teststation.service.TeacherSchuduleServise;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class SchuduleController {

    private final TeacherSchuduleServise teacherSchuduleServise;

    @GetMapping("/{date}/{teachername}")
    public ResponseEntity<?> getSchuduleByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String teachername) {
        
        try {
            List<TeacherSchuduleDto> schedule = teacherSchuduleServise.getTeacherSchuduleByDate(teachername, date);

            Map<String, Object> response = new HashMap<>();
            response.put("teacher", teachername);
            response.put("date", date);
            response.put("schedule", schedule);
        
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}