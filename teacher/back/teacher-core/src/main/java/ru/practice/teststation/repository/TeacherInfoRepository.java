package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.practice.teststation.model.TeacherTimetable;

public interface TeacherInfoRepository extends JpaRepository<TeacherTimetable, Long> {
    
}
