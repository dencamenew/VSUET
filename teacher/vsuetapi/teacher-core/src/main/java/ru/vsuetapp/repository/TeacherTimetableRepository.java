package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.TeacherTimetable;

import java.util.Optional;

@Repository
public interface TeacherTimetableRepository extends JpaRepository<TeacherTimetable, Long> {

    // поиск расписания по имени преподавателя
    Optional<TeacherTimetable> findByTeacherName(String teacherName);
}
