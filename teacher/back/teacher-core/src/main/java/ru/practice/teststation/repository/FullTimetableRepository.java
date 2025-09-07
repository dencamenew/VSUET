// FullTimetableRepository.java
package ru.practice.teststation.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.practice.teststation.model.FullTimetable;
import ru.practice.teststation.dto.AttendanceDto;
import java.util.List;

@Repository
public interface FullTimetableRepository extends JpaRepository<FullTimetable, Long> {
    
    @Query("SELECT new ru.practice.teststation.dto.AttendanceDto(" +
           "f.id, f.studentId, f.time, f.date, f.turnout) " +
           "FROM FullTimetable f " +
           "WHERE f.teacher = :teacher AND f.subject = :subject AND f.groupName = :groupName")
    List<AttendanceDto> getAttendenceVed(
            @Param("teacher") String teacher,
            @Param("subject") String subject,
            @Param("groupName") String groupName);

    // Метод для обновления посещаемости
    @Modifying
    @Query("UPDATE FullTimetable f SET f.turnout = :turnout WHERE f.id = :id")
    int updateAttendance(@Param("id") Long id, @Param("turnout") Boolean turnout);
}