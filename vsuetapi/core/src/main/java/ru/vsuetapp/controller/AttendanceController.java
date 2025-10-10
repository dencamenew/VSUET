package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.repository.TeacherInfoRepository;
import ru.vsuetapp.service.AttendanceService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final TeacherInfoRepository teacherInfoRepository;

    // 🧑‍🏫 Генерация ведомости для преподавателя
    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestParam String teacherName) {
        TimetableDto timetable = teacherInfoRepository.findTimetableByTeacherName(teacherName)
                .map(TeacherTimetable::getTimetableJsonDto)
                .orElseThrow(() -> new RuntimeException("Расписание преподавателя не найдено"));

        attendanceService.generateAttendanceFromTeacherTimetable(timetable, teacherName);
        return ResponseEntity.ok("Ведомости успешно сгенерированы");
    }

    // 🧑‍🎓 Получение посещаемости студента по номеру зачётной книжки
    @GetMapping("/student/zach")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendanceByZach(@RequestParam String zachNumber) {
        List<Map<String, Object>> attendance = attendanceService.getStudentAttendanceByZach(zachNumber);
        if (attendance.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(attendance);
    }

    // 🧑‍🎓 Получение посещаемости студента по имени
    @GetMapping("/student/name")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendanceByName(@RequestParam String studentName) {
        List<Map<String, Object>> attendance = attendanceService.getStudentAttendanceByName(studentName);
        if (attendance.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(attendance);
    }

    // 👩‍🏫 Преподаватель — отчет по группе и предмету
    @GetMapping("/teacher/group")
    public ResponseEntity<List<Map<String, Object>>> getGroupAttendance(
            @RequestParam String groupName,
            @RequestParam String subjectName) {
        return ResponseEntity.ok(attendanceService.getGroupAttendance(groupName, subjectName));
    }

    // 👩‍🏫 Преподаватель — отчет по конкретной паре
    @GetMapping("/teacher/lesson")
    public ResponseEntity<List<Map<String, Object>>> getLessonAttendance(
            @RequestParam String groupName,
            @RequestParam String subjectName,
            @RequestParam String date,
            @RequestParam String time) {
        return ResponseEntity.ok(attendanceService.getLessonAttendance(groupName, subjectName, date, time));
    }
}
