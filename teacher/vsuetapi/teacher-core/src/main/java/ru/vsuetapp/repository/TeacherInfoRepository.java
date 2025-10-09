package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.TeacherInfo;

import java.util.Optional;

@Repository
public interface TeacherInfoRepository extends JpaRepository<TeacherInfo, Long> {

    // поиск по имени преподавателя
    Optional<TeacherInfo> findByTeacherName(String teacherName);
}
