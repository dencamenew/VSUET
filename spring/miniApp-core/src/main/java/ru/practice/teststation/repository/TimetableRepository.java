package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.practice.teststation.model.Timetable;
import java.util.Optional;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    Optional<Timetable> findByGroupName(String groupName);

    @Query(value = "SELECT timetable FROM timetable WHERE group_name = :groupName", nativeQuery = true)
    Optional<String> findTimetableJsonByGroupName(@Param("groupName") String groupName);
}