package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.TeacherInfo;

public interface TeacherSchuduleRepository extends JpaRepository<TeacherInfo, Long> {
    
}
