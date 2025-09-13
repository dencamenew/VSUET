package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.practice.teststation.model.FullTimetable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface FullTimetableRepository extends JpaRepository<FullTimetable, Long> {
    
    // Добавьте эти методы обратно
    List<FullTimetable> findByZachNumber(String zachNumber);
    
    List<FullTimetable> findByDateAndZachNumber(LocalDate date, String zachNumber);
    
    @Query("SELECT f FROM FullTimetable f WHERE f.zachNumber = :zachNumber AND f.date = :date AND f.time = :time")
    List<FullTimetable> findByZachNumberAndDateAndTime(
        @Param("zachNumber") String zachNumber,
        @Param("date") LocalDate date,
        @Param("time") LocalTime time
    );
    
    @Query("SELECT f FROM FullTimetable f WHERE f.date = :date AND f.time = :time AND f.teacher = :teacher")
    List<FullTimetable> findByDateTimeAndTeacher(
        @Param("date") LocalDate date,
        @Param("time") LocalTime time,
        @Param("teacher") String teacher
    );
}