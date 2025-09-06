package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.practice.teststation.model.TeacherInfo;
import ru.practice.teststation.repository.TeacherInfoRepository;
import ru.practice.teststation.dto.requests.LoginRequest;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final TeacherInfoRepository teacherInfoRepository;
    
    public TeacherInfo login(LoginRequest request) {
        try {
            TeacherInfo teacher = teacherInfoRepository.findByName(request.getName())
                    .orElseThrow(() -> new RuntimeException("Пользователь с таким именем не найден"));
            
            // Временная проверка без PasswordEncoder
            if (!request.getPassword().equals(teacher.getPassword())) {
                throw new RuntimeException("Неверный пароль");
            }
            
            return teacher;
            
        } catch (Exception e) {
            throw new RuntimeException("Ошибка аутентификации: " + e.getMessage());
        }
    }
}