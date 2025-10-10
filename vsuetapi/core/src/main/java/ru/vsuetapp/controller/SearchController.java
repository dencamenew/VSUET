package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.service.SearchService;

@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/teacher-timetable")
    public ResponseEntity<?> getTeacherTimetable(@RequestParam String name) {
        return searchService.getTeacherTimetable(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/group-timetable")
    public ResponseEntity<?> getGroupTimetable(@RequestParam String name) {
        return searchService.getGroupTimetable(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
