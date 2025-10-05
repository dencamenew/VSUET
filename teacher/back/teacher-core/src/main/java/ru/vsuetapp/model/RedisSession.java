package ru.vsuetapp.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.redis.core.RedisHash;
import jakarta.persistence.Id;
import lombok.Data;
import ru.vsuetapp.model.enums.RoleForSession;
import ru.vsuetapp.model.enums.StatusInSession;

@Data
@RedisHash("teacherSession")
public class RedisSession {
    @Id
    private String id = UUID.randomUUID().toString();
    private RoleForSession role;
    private Long userId; // из teacher_info
    private String name;
    private StatusInSession status;
    private LocalDateTime createdAt;
    private LocalDateTime existedAt;
}

