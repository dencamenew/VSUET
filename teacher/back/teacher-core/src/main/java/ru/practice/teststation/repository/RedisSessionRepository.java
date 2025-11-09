package ru.practice.teststation.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import ru.practice.teststation.model.RedisSession;
import ru.practice.teststation.model.enums.StatusInSession;

@Repository
public interface RedisSessionRepository extends CrudRepository<RedisSession, String> {
    List<RedisSession> findByUserIdAndStatus(Long userId, StatusInSession status);
}