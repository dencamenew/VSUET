package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.vsuetapp.model.Attendance;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByTeacherName(String teacherName);
    List<Attendance> findByGroupName(String groupName);

    @Query("SELECT a FROM Attendance a WHERE a.groupName = :groupName AND a.subjectName = :subjectName")
    List<Attendance> findByGroupAndSubject(@Param("groupName") String groupName, @Param("subjectName") String subjectName);

    @Query("SELECT a FROM Attendance a WHERE a.groupName = :groupName AND a.subjectName = :subjectName AND a.day = :day AND a.time = :time")
    List<Attendance> findByLesson(@Param("groupName") String groupName,
                                  @Param("subjectName") String subjectName,
                                  @Param("day") String day,
                                  @Param("time") String time);
}