package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.vsuetapp.model.AttendanceReport;

import java.util.List;

public interface AttendanceReportRepository extends JpaRepository<AttendanceReport, Long> {
    List<AttendanceReport> findByTeacherName(String teacherName);
    List<AttendanceReport> findByGroupName(String groupName);
}

