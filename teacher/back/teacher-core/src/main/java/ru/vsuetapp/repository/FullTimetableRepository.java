package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import ru.vsuetapp.model.FullTimetable;
import ru.vsuetapp.dto.AttendanceDto;
import ru.vsuetapp.dto.TeacherSchuduleDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

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

    @Modifying
    @Query("UPDATE FullTimetable f SET f.turnout = :turnout WHERE f.id = :id")
    int updateAttendance(@Param("id") Long id, @Param("turnout") Boolean turnout);

    // Уникальное расписание учителя на дату с DISTINCT
    @Query("SELECT DISTINCT new ru.practice.teststation.dto.TeacherSchuduleDto(" +
           "MIN(f.id) OVER (PARTITION BY f.date, f.time, f.subject, f.groupName, f.typeSubject, f.audience), " +
           "f.time, f.date, f.subject, f.groupName, f.typeSubject, f.audience) " +
           "FROM FullTimetable f " +
           "WHERE f.teacher = :teacher AND f.date = :date " +
           "ORDER BY f.time")
    List<TeacherSchuduleDto> getTeacherSchuduleByDate(
            @Param("teacher") String teacher,
            @Param("date") LocalDate date);

    @Transactional
    @Modifying
    @Query("UPDATE FullTimetable f SET f.comment = :comment " +
           "WHERE f.subject = :subject AND f.groupName = :groupName " +
           "AND f.time = :time AND f.date = :date AND f.teacher = :teacher")
    int updateComment(
            @Param("subject") String subject,
            @Param("groupName") String groupName,
            @Param("time") LocalTime time,
            @Param("date") LocalDate date,
            @Param("teacher") String teacher,
            @Param("comment") String comment);

    @Query(value = "SELECT comment FROM full_timetable WHERE teacher = :teacher AND subject = :subject AND time = :time AND date = :date AND group_name = :groupName LIMIT 1", 
           nativeQuery = true)
    Optional<String> findComment(@Param("teacher") String teacher,
                                @Param("subject") String subject,
                                @Param("time") LocalTime time,
                                @Param("date") LocalDate date,
                                @Param("groupName") String groupName);

    @Transactional                            
    @Modifying
    @Query("DELETE FROM FullTimetable f " +
           "WHERE f.subject = :subject AND f.groupName = :groupName " +
           "AND f.time = :time AND f.date = :date AND f.teacher = :teacher " +
           "AND f.comment IS NOT NULL")
    int deleteComment(
            @Param("subject") String subject,
            @Param("groupName") String groupName,
            @Param("time") LocalTime time,
            @Param("date") LocalDate date,
            @Param("teacher") String teacher);

            
}