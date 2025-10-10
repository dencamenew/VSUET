package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.model.GroupTimetable;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.model.User;
import ru.vsuetapp.model.AttendanceReport;
import ru.vsuetapp.repository.AttendanceReportRepository;
import ru.vsuetapp.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final AttendanceReportRepository attendanceReportRepository;

    // @PostMapping("/generate")
    // public ResponseEntity<String> generateAllReports() {
    //     attendanceService.generateReports();
    //     return ResponseEntity.ok("Ведомости успешно сгенерированы");
    // }

    @GetMapping("/teacher/{name}")
    public ResponseEntity<List<AttendanceReport>> getTeacherReports(@PathVariable String name) {
        return ResponseEntity.ok(attendanceReportRepository.findByTeacherName(name));
    }

    @GetMapping("/group/{group}")
    public ResponseEntity<List<AttendanceReport>> getGroupReports(@PathVariable String group) {
        return ResponseEntity.ok(attendanceReportRepository.findByGroupName(group));
    }
}

