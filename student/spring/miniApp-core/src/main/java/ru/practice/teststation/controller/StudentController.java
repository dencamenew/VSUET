package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.TimetableWithAttendanceDto;
import ru.practice.teststation.model.FullTimetable;
import ru.practice.teststation.service.StudentService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // Сначала специфичные эндпоинты
    @GetMapping("/info/{zachNumber}")
    public ResponseEntity<?> getStudentInfo(@PathVariable String zachNumber) {
        return ResponseEntity.ok(studentService.getStudentInfo(zachNumber));
    }

    @GetMapping("/timetable/{zachNumber}")
    public ResponseEntity<?> getTimetable(@PathVariable String zachNumber) {
        return ResponseEntity.ok(studentService.getTimetable(zachNumber));
    }

    @GetMapping("/ratings/{zachNumber}")
    public ResponseEntity<?> getRatings(@PathVariable String zachNumber) {
        return ResponseEntity.ok(studentService.getRatings(zachNumber));
    }

    @GetMapping("/debug/{zachNumber}")
    public ResponseEntity<List<FullTimetable>> getDebugTimetable(@PathVariable String zachNumber) {
        List<FullTimetable> entries = studentService.getDebugTimetable(zachNumber);
        return ResponseEntity.ok(entries);
    }

    // Общие эндпоинты с параметрами в конце
    @GetMapping("/{date}/{zachNumber}")
    public ResponseEntity<TimetableWithAttendanceDto> getTimetableWithAttendance(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String zachNumber) {
        TimetableWithAttendanceDto response = studentService.getTimetableWithAttendance(date, zachNumber);
        return ResponseEntity.ok(response);
    }

    // Эндпоинт для обновления комментария
    @PatchMapping("/comment/{id}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String comment = request.get("comment");
        studentService.updateComment(id, comment);
        return ResponseEntity.ok().build();
    }

    // Эндпоинт для обновления посещаемости и комментария
    @PatchMapping("/attendance/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Boolean turnout = (Boolean) request.get("turnout");
        String comment = (String) request.get("comment");
        studentService.updateAttendance(id, turnout, comment);
        return ResponseEntity.ok().build();
    }
}