package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.DeanInfo;

import java.util.Optional;

@Repository
public interface DeanInfoRepository extends JpaRepository<DeanInfo, Long> {
    Optional<DeanInfo> findByDeanName(String deanName);
    Optional<DeanInfo> findByFacultyName(String facultyName);
}
