package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import ru.practice.teststation.dto.requests.LoginRequest;
import ru.practice.teststation.model.TeacherInfo;
import ru.practice.teststation.service.AuthService;





@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            TeacherInfo teacher = authService.login(request);
            
            
            session.setAttribute("user", teacher);
            
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "user", teacher,
                "sessionId", session.getId()
            ));
            
        } catch (RuntimeException e) {
            // ИНВАЛИДИРУЕМ сессию при ошибке аутентификации
            session.invalidate();
            
            return ResponseEntity.status(401).body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}