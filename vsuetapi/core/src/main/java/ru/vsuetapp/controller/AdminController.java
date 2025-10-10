package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.GroupTimetable;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.model.User;
import ru.vsuetapp.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // =============== CREATE USERS ===============
    @PostMapping("/users/create/dean")
    public ResponseEntity<User> createDeanUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam Long facultyId
    ) {
        return ResponseEntity.ok(adminService.createDeanUser(username, password, facultyId));
    }

    @PostMapping("/users/create/student")
    public ResponseEntity<User> createStudentUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam Long groupId,
            @RequestParam String zachNumber
    ) {
        return ResponseEntity.ok(adminService.createStudentUser(username, password, groupId, zachNumber));
    }

    @PostMapping("/users/create/teacher")
    public ResponseEntity<User> createTeacherUser(
            @RequestParam String username,
            @RequestParam String password
    ) {
        return ResponseEntity.ok(adminService.createTeacherUser(username, password));
    }

    @PostMapping("/users/create/admin")
    public ResponseEntity<User> createAdminUser(
            @RequestParam String username,
            @RequestParam String password
    ) {
        return ResponseEntity.ok(adminService.createAdminUser(username, password));
    }

    // =============== DELETE USERS ===============
    @DeleteMapping("/users/delete/dean/{userId}")
    public ResponseEntity<String> deleteDeanUser(@PathVariable Long userId) {
        adminService.deleteDeanUser(userId);
        return ResponseEntity.ok("Декан и его информация успешно удалены");
    }

    @DeleteMapping("/users/delete/student/{userId}")
    public ResponseEntity<String> deleteStudentUser(@PathVariable Long userId) {
        adminService.deleteStudentUser(userId);
        return ResponseEntity.ok("Студент и его информация успешно удалены");
    }

    @DeleteMapping("/users/delete/teacher/{userId}")
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
        adminService.deleteStudentTimetable(groupId);
        return ResponseEntity.ok("Расписание группы удалено");
    }
}
