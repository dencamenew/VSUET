package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.TimetableWithAttendanceDto;
import ru.practice.teststation.model.FullTimetable;
import ru.practice.teststation.service.StudentService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/info/{zachNumber}")
    public ResponseEntity<Map<String, Object>> getStudentInfo(@PathVariable String zachNumber) {
        // Получаем базовую информацию о студенте
        List<FullTimetable> entries = studentService.getDebugTimetable(zachNumber);
        
        if (entries.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        FullTimetable firstEntry = entries.get(0);
        
        Map<String, Object> response = new HashMap<>();
        response.put("zachNumber", zachNumber);
        response.put("groupName", firstEntry.getGroupName());
        response.put("studentName", "Студент"); 
        
        return ResponseEntity.ok(response);
    }


    @GetMapping("/timetable/{zachNumber}")
    public ResponseEntity<TimetableWithAttendanceDto> getTimetable(@PathVariable String zachNumber) {
        return ResponseEntity.ok(studentService.getTimetable(zachNumber));
    }

    @GetMapping("/{date}/{zachNumber}")
    public ResponseEntity<TimetableWithAttendanceDto> getTimetableWithAttendance(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String zachNumber) {
        TimetableWithAttendanceDto response = studentService.getTimetableWithAttendance(date, zachNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/debug/{zachNumber}")
    public ResponseEntity<List<FullTimetable>> getDebugTimetable(@PathVariable String zachNumber) {
        List<FullTimetable> entries = studentService.getDebugTimetable(zachNumber);
        return ResponseEntity.ok(entries);
    }

    @PatchMapping("/comment/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String comment = request.get("comment");
        studentService.updateComment(id, comment);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/attendance/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Boolean turnout = (Boolean) request.get("turnout");
        String comment = (String) request.get("comment");
        studentService.updateAttendance(id, turnout, comment);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ratings/{zachNumber}")
    public ResponseEntity<?> getRatings(@PathVariable String zachNumber) {
        return ResponseEntity.ok(studentService.getRatings(zachNumber));
    }
}