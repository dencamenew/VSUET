package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vsuetapp.model.Attendance;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByTeacherName(String teacherName);
    List<Attendance> findByGroupName(String groupName);
}

