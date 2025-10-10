package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.Faculty;
import ru.vsuetapp.model.GroupTimetable;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.model.User;
import ru.vsuetapp.service.AdminService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // =============== FACULTY ===============
    @PostMapping("/faculty")
    public ResponseEntity<?> createDeanUser(
            @RequestParam String facultyName
    ) {
        try {
            Faculty faculty = adminService.createFaculty(facultyName);
            return ResponseEntity.ok(faculty);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        try {
            adminService.deleteFacultyById(id);
            return ResponseEntity.ok(Map.of("message", "Факультет успешно удалён"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =============== CREATE USERS ===============
    @PostMapping("/users/dean")
    public ResponseEntity<?> createDeanUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String deanName,
            @RequestParam Long facultyId
    ) {
        try {
            User user = adminService.createDeanUser(username, password, deanName, facultyId);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/student")
    public ResponseEntity<?> createStudentUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String studentName,
            @RequestParam Long groupId,
            @RequestParam String zachNumber
    ) {
        try {
            User user = adminService.createStudentUser(username, password, studentName, groupId, zachNumber);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/teacher")
    public ResponseEntity<?> createTeacherUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String teacherName
    ) {
        try {
            User user = adminService.createTeacherUser(username, password, teacherName);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/admin")
    public ResponseEntity<?> createAdminUser(
            @RequestParam String username,
            @RequestParam String password
    ) {
        try {
            User user = adminService.createAdminUser(username, password);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // =============== DELETE USERS ===============
    @DeleteMapping("/users/dean/{userId}")
    public ResponseEntity<String> deleteDeanUser(@PathVariable Long userId) {
        adminService.deleteDeanUser(userId);
        return ResponseEntity.ok("Декан и его информация успешно удалены");
    }

    @DeleteMapping("/users/student/{userId}")
    public ResponseEntity<String> deleteStudentUser(@PathVariable Long userId) {
        adminService.deleteStudentUser(userId);
        return ResponseEntity.ok("Студент и его информация успешно удалены");
    }

    @DeleteMapping("/users/teacher/{userId}")
    public ResponseEntity<String> deleteTeacherUser(@PathVariable Long userId) {
        adminService.deleteTeacherUser(userId);
        return ResponseEntity.ok("Преподаватель и его информация успешно удалены");
    }


    // =============== TEACHER TIMETABLE ===============
    @PostMapping("/timetable/teacher/{teacherId}")
    public ResponseEntity<TeacherTimetable> createTeacherTimetable(
            @PathVariable Long teacherId,
            @RequestBody TimetableDto timetableDto
    ) {
        return ResponseEntity.ok(adminService.createTeacherTimetable(teacherId, timetableDto));
    }

    @DeleteMapping("/timetable/teacher/{id}")
    public ResponseEntity<String> deleteTeacherTimetable(@PathVariable Long id) {
        adminService.deleteTeacherTimetable(id);
        return ResponseEntity.ok("Расписание преподавателя удалено");
    }

    // =============== GROUP TIMETABLE ===============
    @PostMapping("/timetable/groups/{groupId}")
    public ResponseEntity<GroupTimetable> createStudentTimetable(
            @PathVariable Long groupId,
            @RequestBody TimetableDto timetableDto
    ) {
        GroupTimetable timetable = adminService.createStudentTimetable(groupId, timetableDto);
        return ResponseEntity.ok(timetable);
    }

    @DeleteMapping("/timetable/groups/{groupId}")
    public ResponseEntity<String> deleteStudentTimetable(@PathVariable Long groupId) {
        adminService.deleteTimetableByGroupId(groupId);
        return ResponseEntity.ok("Расписание группы удалено");
    }
}
