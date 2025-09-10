package ru.practice.teststation.model;

import java.time.LocalDateTime;

import org.springframework.data.redis.core.RedisHash;
import jakarta.persistence.Id;
import lombok.Data;
import ru.practice.teststation.model.enums.RoleForSession;
import ru.practice.teststation.model.enums.StatusInSession;

@Data
@RedisHash("session")
public class RedisSession {
    @Id
    private Long id;
    private RoleForSession role;
    private Long userId; // из teacher_info
    private String name;
    private StatusInSession status;
    private LocalDateTime createdAt;
    private LocalDateTime existedAt;
}

