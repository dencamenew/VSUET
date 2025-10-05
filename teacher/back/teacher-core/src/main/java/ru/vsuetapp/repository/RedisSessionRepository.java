package ru.vsuetapp.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.RedisSession;
import ru.vsuetapp.model.enums.StatusInSession;

@Repository
public interface RedisSessionRepository extends CrudRepository<RedisSession, String> {
    List<RedisSession> findByUserIdAndStatus(Long userId, StatusInSession status);
}