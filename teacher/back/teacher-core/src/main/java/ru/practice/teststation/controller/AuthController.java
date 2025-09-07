package ru.practice.teststation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import ru.practice.teststation.dto.requests.LoginRequest;
import ru.practice.teststation.model.TeacherInfo;
import ru.practice.teststation.service.AuthService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            TeacherInfo teacher = authService.login(request);
            
            session.setAttribute("teacherId", teacher.getId());
            session.setAttribute("teacherName", teacher.getName());
            session.setAttribute("authenticated", true);
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                teacher.getId(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_TEACHER"))
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "teacher", teacher,
                "sessionId", session.getId()
            ));
            
        } catch (RuntimeException e) {
            session.invalidate();
            SecurityContextHolder.clearContext();
            
            return ResponseEntity.status(401).body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            
            if (session != null) {
                session.invalidate();
                SecurityContextHolder.clearContext();
                
                return ResponseEntity.ok(Map.of(
                    "message", "Logout successful",
                    "sessionInvalidated", true
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "No active session found",
                    "sessionInvalidated", false
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Logout failed: " + e.getMessage(),
                "code", "LOGOUT_ERROR"
            ));
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkSession(HttpSession session) {
        Boolean authenticated = (Boolean) session.getAttribute("authenticated");
        
        if (authenticated != null && authenticated) {
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "teacherId", session.getAttribute("teacherId"),
                "teacherName", session.getAttribute("teacherName")
            ));
        }
        
        return ResponseEntity.status(401).body(Map.of(
            "authenticated", false
        ));
    }
}