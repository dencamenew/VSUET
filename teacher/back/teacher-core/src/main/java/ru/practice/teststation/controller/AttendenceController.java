// AttendenceController.java
package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.practice.teststation.dto.AttendanceDto;
import ru.practice.teststation.service.AttendenceService;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendenceController {
    
    private final AttendenceService attendenceService;

    @GetMapping("/vedomost")
    public ResponseEntity<?> getAttendance(
            @RequestParam String teacher,
            @RequestParam String subject,
            @RequestParam String groupName) {
        
        try {
            List<AttendanceDto> attendanceList = attendenceService.getAttendenceVed(teacher, subject, groupName);
            
            if (attendanceList.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "NOT_FOUND");
                response.put("message", "Данные по посещаемости не найдены");
                response.put("teacher", teacher);
                response.put("subject", subject);
                response.put("groupName", groupName);
                response.put("data", attendanceList);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Данные по посещаемости успешно получены");
            response.put("teacher", teacher);
            response.put("subject", subject);
            response.put("groupName", groupName);
            response.put("data", attendanceList);
            response.put("count", attendanceList.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Ошибка при получении данных: " + e.getMessage());
            errorResponse.put("teacher", teacher);
            errorResponse.put("subject", subject);
            errorResponse.put("groupName", groupName);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Ручка для обновления посещаемости
    @PutMapping("/update-attendance")
    public ResponseEntity<?> updateAttendance(@RequestBody AttendanceUpdateRequest updateRequest) {
        try {
            boolean updated = attendenceService.updateAttendance(
                updateRequest.getId(),
                updateRequest.getTurnout()
            );
            
            if (updated) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "SUCCESS");
                response.put("message", "Посещаемость успешно обновлена");
                response.put("recordId", updateRequest.getId());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "NOT_FOUND");
                response.put("message", "Запись не найдена");
                response.put("recordId", updateRequest.getId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Ошибка при обновлении посещаемости: " + e.getMessage());
            errorResponse.put("recordId", updateRequest.getId());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Внутренний класс для запроса обновления посещаемости
    public static class AttendanceUpdateRequest {
        private Long id;
        private Boolean turnout;

        // Геттеры и сеттеры
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Boolean getTurnout() {
            return turnout;
        }

        public void setTurnout(Boolean turnout) {
            this.turnout = turnout;
        }
    }
}