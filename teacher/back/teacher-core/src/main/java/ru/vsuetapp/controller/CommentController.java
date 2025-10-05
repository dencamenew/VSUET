package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.requests.CommentRequest;
import ru.vsuetapp.repository.FullTimetableRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class CommentController {

    private final FullTimetableRepository fullTimetableRepository;

    // Сохранить или обновить комментарий
    @PostMapping
    public ResponseEntity<?> saveComment(@RequestBody CommentRequest commentRequest) {
        try {
            LocalDate date = LocalDate.parse(commentRequest.getDate());
            LocalTime time = LocalTime.parse(commentRequest.getTime());
            
            int updated = fullTimetableRepository.updateComment(
                commentRequest.getSubject(),
                commentRequest.getGroupName(),
                time,
                date,
                commentRequest.getTeacher(),
                commentRequest.getComment()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", updated > 0 ? "Comment updated" : "Comment saved");
            response.put("updatedRows", updated);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to save comment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Получить комментарий
    @GetMapping
    public ResponseEntity<?> getComment(
            @RequestParam String subject,
            @RequestParam String groupName,
            @RequestParam String time,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String teacher) {
        
        try {
            LocalTime lessonTime = LocalTime.parse(time);
            Optional<String> comment = fullTimetableRepository.findComment(
                subject, groupName, lessonTime, date, teacher
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("comment", comment.orElse(""));
            response.put("exists", comment.isPresent());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get comment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Удалить комментарий
    @DeleteMapping
    public ResponseEntity<?> deleteComment(
            @RequestParam String subject,
            @RequestParam String groupName,
            @RequestParam String time,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String teacher) {
        
        try {
            LocalTime lessonTime = LocalTime.parse(time);
            int deleted = fullTimetableRepository.deleteComment(
                subject, groupName, lessonTime, date, teacher
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", deleted > 0 ? "Comment deleted" : "No comment found");
            response.put("deletedRows", deleted);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete comment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}