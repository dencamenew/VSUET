package ru.vsuetapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ru.vsuetapp.model.TeacherTimetable;

@Repository
public interface TeacherTimetableRepository extends JpaRepository<TeacherTimetable, Long> {

    @Query("SELECT tt FROM TeacherTimetable tt JOIN tt.teacherInfo ti WHERE ti.teacherName = :teacherName")
    Optional<TeacherTimetable> findByTeacherName(@Param("teacherName") String teacherName);
}
