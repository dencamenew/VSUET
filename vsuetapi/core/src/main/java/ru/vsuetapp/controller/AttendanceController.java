package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.repository.AttendanceRepository;
import ru.vsuetapp.repository.TeacherInfoRepository;
import ru.vsuetapp.service.AttendanceService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/attendance")
public class AttendanceController {

    private final AttendanceService attendanceGenerationService;
    private final TeacherInfoRepository teacherInfoRepository;

    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestParam String teacherName) {
        TimetableDto timetable = teacherInfoRepository.findTimetableByTeacherName(teacherName)
                .map(TeacherTimetable::getTimetableJsonDto)
                .orElseThrow(() -> new RuntimeException("Расписание преподавателя не найдено"));

        attendanceGenerationService.generateAttendanceFromTeacherTimetable(timetable, teacherName);
        return ResponseEntity.ok("Ведомости успешно сгенерированы");
    }
}

