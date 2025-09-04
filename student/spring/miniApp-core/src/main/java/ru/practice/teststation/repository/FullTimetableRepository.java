package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.practice.teststation.model.FullTimetable;

import java.time.LocalDate;
import java.util.List;

public interface FullTimetableRepository extends JpaRepository<FullTimetable, Long> {

    @Query("SELECT ft FROM FullTimetable ft WHERE ft.date = :date AND ft.zachNumber = :zachNumber ORDER BY ft.time")
    List<FullTimetable> findByDateAndZachNumber(@Param("date") LocalDate date,
                                                @Param("zachNumber") String zachNumber);

    List<FullTimetable> findByZachNumber(String zachNumber);

    @Query("SELECT ft FROM FullTimetable ft WHERE ft.zachNumber = :zachNumber ORDER BY ft.date, ft.time")
    List<FullTimetable> findByZachNumberOrderByDate(@Param("zachNumber") String zachNumber);
}