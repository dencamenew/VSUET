package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.Faculty;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    /**
     * Поиск факультета по названию
     */
    Optional<Faculty> findByName(String name);

    /**
     * Проверка существования факультета по названию
     */
    boolean existsByName(String name);
}
