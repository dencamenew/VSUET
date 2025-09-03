package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.Zach;
import java.util.List;
import java.util.Optional;

public interface ZachRepository extends JpaRepository<Zach, Long> {
    Optional<Zach> findByZachNumber(String zachNumber);
    List<Zach> findByGroupName(String groupName);
}