package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.SbjUrls;
import java.util.Optional;

public interface SbjUrlsRepository extends JpaRepository<SbjUrls, Long> {
    Optional<SbjUrls> findByGroupName(String groupName);
}