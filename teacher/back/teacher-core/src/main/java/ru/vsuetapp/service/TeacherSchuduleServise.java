package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.vsuetapp.dto.TeacherSchuduleDto;
import ru.vsuetapp.repository.FullTimetableRepository;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherSchuduleServise {
    private final FullTimetableRepository fullTimetableRepository;

    public List<TeacherSchuduleDto> getTeacherSchuduleByDate(String teacher, LocalDate date) {
        log.info("Getting schedule for teacher: '{}' on date: {}", teacher, date);
        List<TeacherSchuduleDto> result = fullTimetableRepository.getTeacherSchuduleByDate(teacher, date);
        log.info("Found {} schedule items", result.size());
        return result;
    }
}