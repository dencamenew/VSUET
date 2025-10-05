package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.model.TeacherInfo;
import ru.vsuetapp.repository.TeacherInfoRepository;
import ru.vsuetapp.dto.requests.LoginRequest;

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