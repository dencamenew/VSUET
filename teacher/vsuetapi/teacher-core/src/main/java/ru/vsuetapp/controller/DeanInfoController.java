package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.model.Groups;
import ru.vsuetapp.model.StudentInfo;
import ru.vsuetapp.service.DeanInfoService;

import java.util.List;

@RestController
@RequestMapping("/api/deans")
@RequiredArgsConstructor
public class DeanInfoController {

    private final DeanInfoService deanInfoService;

    // =============== GROUPS ===============

    @GetMapping("/{deanId}/groups")
    public ResponseEntity<List<Groups>> getGroupsByDean(@PathVariable Long deanId) {
        return ResponseEntity.ok(deanInfoService.getAllGroupsByDean(deanId));
    }

    @PostMapping("/{deanId}/groups")
    public ResponseEntity<Groups> createGroup(
            @PathVariable Long deanId,
            @RequestParam String name
    ) {
        return ResponseEntity.ok(deanInfoService.createGroup(deanId, name));
    }

    @DeleteMapping("/{deanId}/groups/{groupId}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable Long deanId,
            @PathVariable Long groupId
    ) {
        deanInfoService.deleteGroup(deanId, groupId);
        return ResponseEntity.ok("Группа успешно удалена");
    }

    // =============== STUDENTS ===============

    /**
     * Получить всех студентов конкретной группы факультета декана
     * GET /api/deans/{deanId}/groups/{groupId}/students
     */
    @GetMapping("/{deanId}/groups/{groupId}/students")
    public ResponseEntity<List<StudentInfo>> getStudentsInGroup(
            @PathVariable Long deanId,
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(deanInfoService.getAllStudentsInGroup(deanId, groupId));
    }

    /**
     * Создать студента внутри конкретной группы факультета декана
     * POST /api/deans/{deanId}/groups/{groupId}/students
     */
    @PostMapping("/{deanId}/groups/{groupId}/students")
    public ResponseEntity<StudentInfo> createStudentInGroup(
            @PathVariable Long deanId,
            @PathVariable Long groupId,
            @RequestParam String name,
            @RequestParam String zach
    ) {
        StudentInfo student = deanInfoService.createStudentInGroup(deanId, groupId, name, zach);
        return ResponseEntity.ok(student);
    }

    /**
     * Удалить студента
     * DELETE /api/deans/{deanId}/students/{studentId}
     */
    @DeleteMapping("/{deanId}/students/{studentId}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable Long deanId,
            @PathVariable Long studentId
    ) {
        deanInfoService.deleteStudent(deanId, studentId);
        return ResponseEntity.ok("Студент успешно удалён");
    }
}
