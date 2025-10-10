package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.vsuetapp.model.TeacherInfo;
import ru.vsuetapp.model.TeacherTimetable;

import java.util.Optional;

@Repository
public interface TeacherInfoRepository extends JpaRepository<TeacherInfo, Long> {

    // поиск по имени преподавателя
    Optional<TeacherInfo> findByTeacherName(String teacherName);


    // Явно указываем, что выбираем TeacherTimetable, а не TeacherInfo
    @Query("SELECT ti.timetable FROM TeacherInfo ti WHERE ti.teacherName = :teacherName")
    Optional<TeacherTimetable> findTimetableByTeacherName(@Param("teacherName") String teacherName);
}
