package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.vsuetapp.model.*;
import ru.vsuetapp.model.enums.Role;
import ru.vsuetapp.repository.*;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final TeacherInfoRepository teacherInfoRepository;
    private final TeacherTimetableRepository teacherTimetableRepository;
    private final AttendanceReportRepository attendanceReportRepository;

    // @Transactional
    // public void generateReportByTeacherName(String teacherName) {
    //     // 1
    //     TeacherInfo teacher = teacherInfoRepository.findByTeacherName(teacherName)
    //             .orElseThrow(() -> new IllegalArgumentException("Преподаватель не найден: " + teacherName));

    //     // 2
    //     Optional<TeacherTimetable> timetableOpt = teacherTimetableRepository.findByTeacherName(teacher.getTeacherName());
    //     if (timetableOpt.isEmpty()) {
    //         throw new IllegalArgumentException("У преподавателя " + teacherName + " нет расписания. Сформировать ведомость невозможно.");
    //     }


    //     // 3 логика создания всех ведомостей

    //     attendanceReportRepository.save(AttendanceReport );
    // }
}


