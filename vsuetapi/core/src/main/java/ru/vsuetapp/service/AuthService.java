package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.dto.requests.LoginRequest;
import ru.vsuetapp.dto.responce.LoginResponse;
import ru.vsuetapp.dto.exception.InvalidCredentialsException;
import ru.vsuetapp.model.*;
import ru.vsuetapp.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        // 1️⃣ Ищем пользователя
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

        // 2️⃣ Проверяем пароль
        if (!request.getPassword().equals(user.getPasswd())) {
            throw new InvalidCredentialsException("Неверный пароль");
        }

        // 3️⃣ Возвращаем разные данные в зависимости от роли
        switch (user.getRole()) {
            case STUDENT:
                if (user.getStudentInfo() == null)
                    throw new InvalidCredentialsException("Информация о студенте отсутствует");

                StudentInfo s = user.getStudentInfo();
                return new LoginResponse(
                        user.getUsername(),
                        user.getRole().toString(),
                        s.getStudentName(),
                        s.getGroup() != null ? s.getGroup().getGroupName() : null,
                        s.getGroup() != null && s.getGroup().getFaculty() != null ? s.getGroup().getFaculty().getName() : null
                );

            case TEACHER:
                if (user.getTeacherInfo() == null)
                    throw new InvalidCredentialsException("Информация о преподавателе отсутствует");

                TeacherInfo t = user.getTeacherInfo();
                return new LoginResponse(
                        user.getUsername(),
                        user.getRole().toString(),
                        t.getTeacherName(),
                        null,
                        null
                );

            case DEAN:
                if (user.getDeanInfo() == null)
                    throw new InvalidCredentialsException("Информация о декане отсутствует");

                DeanInfo d = user.getDeanInfo();
                return new LoginResponse(
                        user.getUsername(),
                        user.getRole().toString(),
                        d.getDeanName(),
                        null,
                        d.getFaculty() != null ? d.getFaculty().getName() : null
                );

            default:
                throw new InvalidCredentialsException("Неизвестная роль пользователя: " + user.getRole());
        }
    }
}
