package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.model.User;
import ru.vsuetapp.service.AdminService;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // =============== CREATE USERS ===============

    @PostMapping("/create/dean")
    public ResponseEntity<User> createDeanUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam Long facultyId
    ) {
        return ResponseEntity.ok(adminService.createDeanUser(username, password, facultyId));
    }

    @PostMapping("/create/student")
    public ResponseEntity<User> createStudentUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam Long groupId,
            @RequestParam String zachNumber
    ) {
        return ResponseEntity.ok(adminService.createStudentUser(username, password, groupId, zachNumber));
    }

     @PostMapping("/create/teacher")
     public ResponseEntity<User> createTeacherUser(
             @RequestParam String username,
             @RequestParam String password
     ) {
         return ResponseEntity.ok(adminService.createTeacherUser(username, password));
     }

    @PostMapping("/create/admin")
    public ResponseEntity<User> createAdminUser(
            @RequestParam String username,
            @RequestParam String password
    ) {
        return ResponseEntity.ok(adminService.createAdminUser(username, password));
    }

    // =============== DELETE USERS ===============

    @DeleteMapping("/delete/dean/{userId}")
    public ResponseEntity<String> deleteDeanUser(@PathVariable Long userId) {
        adminService.deleteDeanUser(userId);
        return ResponseEntity.ok("Декан и его информация успешно удалены");
    }

    @DeleteMapping("/delete/student/{userId}")
    public ResponseEntity<String> deleteStudentUser(@PathVariable Long userId) {
        adminService.deleteStudentUser(userId);
        return ResponseEntity.ok("Студент и его информация успешно удалены");
    }

     @DeleteMapping("/delete/teacher/{userId}")
     public ResponseEntity<String> deleteTeacherUser(@PathVariable Long userId) {
         adminService.deleteTeacherUser(userId);
         return ResponseEntity.ok("Преподаватель и его информация успешно удалены");
     }

    @DeleteMapping("/delete/admin/{userId}")
    public ResponseEntity<String> deleteAdminUser(@PathVariable Long userId) {
        adminService.deleteAdminUser(userId);
        return ResponseEntity.ok("Администратор успешно удалён");
    }

    // =============== TEACHER TIMETABLE ===============
    @PostMapping("/teacher/{teacherId}/timetable")
    public ResponseEntity<TeacherTimetable> createTeacherTimetable(
            @PathVariable Long teacherId,
            @RequestParam String timetableJson
    ) {
        return ResponseEntity.ok(adminService.createTeacherTimetable(teacherId, timetableJson));
    }

    @DeleteMapping("/api/admin/teachers/{id}/timetable")
    public ResponseEntity<String> deleteTeacherTimetable(@PathVariable Long id) {
        adminService.deleteTeacherTimetable(id);
        return ResponseEntity.ok("Расписание преподавателя удалено");
    }
}
