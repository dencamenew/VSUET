package ru.vsuetapp.dto.responce;

import lombok.AllArgsConstructor;
import lombok.Data;
import ru.vsuetapp.model.enums.Role;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String username;
    private Role role;
    private LocalDateTime loginTime;
}
