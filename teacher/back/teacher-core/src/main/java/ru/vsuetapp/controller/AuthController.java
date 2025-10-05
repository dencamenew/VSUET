package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.requests.LoginRequest;
import ru.vsuetapp.model.RedisSession;

import ru.vsuetapp.model.TeacherInfo;
import ru.vsuetapp.model.enums.RoleForSession;
import ru.vsuetapp.model.enums.StatusInSession;
import ru.vsuetapp.repository.RedisSessionRepository;
import ru.vsuetapp.service.AuthService;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AuthController {
    
    private final AuthService authService;
    private final RedisSessionRepository redisSessionRepository;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            TeacherInfo teacher = authService.login(request);
            
            // 2. Создаем новую сессию в Redis
            RedisSession redisSession = new RedisSession();
            redisSession.setUserId(teacher.getId());
            redisSession.setRole(RoleForSession.TEACHER);
            redisSession.setName(teacher.getName());
            redisSession.setStatus(StatusInSession.ACTIVE);
            redisSession.setCreatedAt(LocalDateTime.now());
            
            redisSessionRepository.save(redisSession);
            
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "teacher", teacher,
                "sessionId", redisSession.getId()
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        try {
            if (sessionId != null && !sessionId.trim().isEmpty()) {
                redisSessionRepository.findById(sessionId).ifPresent(redisSession -> {
                    redisSession.setStatus(StatusInSession.CLOSED);
                    redisSession.setExistedAt(LocalDateTime.now());
                    redisSessionRepository.save(redisSession);
                });
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Logout successful",
                "sessionInvalidated", true
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Logout failed: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkSession(@RequestHeader("X-Session-Id") String sessionId) {
        RedisSession redisSession = redisSessionRepository.findById(sessionId).orElse(null);
        
        if (redisSession != null && redisSession.getStatus() == StatusInSession.ACTIVE) {
            redisSession.setExistedAt(LocalDateTime.now());
            redisSessionRepository.save(redisSession);
            
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "teacherName", redisSession.getName(),
                "sessionId", redisSession.getId()
            ));
        }
        
        return ResponseEntity.status(401).body(Map.of("authenticated", false));
    }
}