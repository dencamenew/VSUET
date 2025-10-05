package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.requests.LoginRequest;

import ru.vsuetapp.model.TeacherInfo;
import ru.vsuetapp.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AuthController {
    
    private final AuthService authService;
    
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            TeacherInfo teacher = authService.login(request);
            
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "teacher", teacher
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        try {
            
            
            return ResponseEntity.ok(Map.of(
                "message", "Logout successful"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Logout failed: " + e.getMessage()
            ));
        }
    }
}