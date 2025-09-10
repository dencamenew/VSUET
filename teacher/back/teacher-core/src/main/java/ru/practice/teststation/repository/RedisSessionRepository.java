package ru.practice.teststation.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import ru.practice.teststation.model.RedisSession;
import ru.practice.teststation.model.enums.StatusInSession;

import java.util.List;

@Repository
public interface RedisSessionRepository extends CrudRepository<RedisSession, Long> {
    
    // Находим все активные сессии по userId
    List<RedisSession> findByUserIdAndStatus(Long userId, StatusInSession status);
}