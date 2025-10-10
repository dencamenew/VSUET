package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.vsuetapp.dto.requests.LoginRequest;
import ru.vsuetapp.dto.responce.LoginResponse;
import ru.vsuetapp.model.User;
import ru.vsuetapp.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswd())) {
            throw new RuntimeException("Неверный пароль");
        }

        return new LoginResponse(
                user.getUsername(),
                user.getRole(),
                LocalDateTime.now()
        );
    }
}
