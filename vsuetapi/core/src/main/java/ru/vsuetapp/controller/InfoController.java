package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.service.InfoService;

@RestController
@RequestMapping("/api/info")
@RequiredArgsConstructor
public class InfoController {

    private final InfoService infoService;

    @GetMapping("/dean/{name}")
    public ResponseEntity<?> getDeanInfo(@PathVariable String name) {
        return infoService.getDeanInfoByName(name)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/teacher/{name}")
    public ResponseEntity<?> getTeacherInfo(@PathVariable String name) {
        return infoService.getTeacherInfoByName(name)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/zach/{zachNumber}")
    public ResponseEntity<?> getStudentInfoByZach(@PathVariable String zachNumber) {
        return infoService.getStudentInfoByZachNumber(zachNumber)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{name}")
    public ResponseEntity<?> getStudentInfoByName(@PathVariable String name) {
        return infoService.getStudentInfoByName(name)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
