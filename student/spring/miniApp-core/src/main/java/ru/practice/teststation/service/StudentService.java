package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.practice.teststation.dto.LessonWithAttendanceDto;
import ru.practice.teststation.dto.TimetableWithAttendanceDto;
import ru.practice.teststation.model.FullTimetable;
import ru.practice.teststation.repository.FullTimetableRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final FullTimetableRepository fullTimetableRepository;

    public TimetableWithAttendanceDto getTimetable(String zachNumber) {
        log.info("Getting timetable for zachNumber: {}", zachNumber);
        List<FullTimetable> entries = fullTimetableRepository.findByZachNumber(zachNumber);
        
        List<LessonWithAttendanceDto> lessons = entries.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
            
        return TimetableWithAttendanceDto.builder()
            .zachNumber(zachNumber)
            .timetable(lessons)
            .build();
    }

    public TimetableWithAttendanceDto getTimetableWithAttendance(LocalDate date, String zachNumber) {
        log.info("Getting timetable with attendance for date: {}, zachNumber: {}", date, zachNumber);
        List<FullTimetable> entries = fullTimetableRepository.findByDateAndZachNumber(date, zachNumber);
        
        List<LessonWithAttendanceDto> lessons = entries.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
            
        return TimetableWithAttendanceDto.builder()
            .zachNumber(zachNumber)
            .date(date)
            .timetable(lessons)
            .build();
    }

    public List<FullTimetable> getDebugTimetable(String zachNumber) {
        return fullTimetableRepository.findByZachNumber(zachNumber);
    }

    public void updateComment(Long id, String comment) {
        FullTimetable entry = fullTimetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Entry not found"));
        entry.setComment(comment);
        fullTimetableRepository.save(entry);
    }

    public void updateAttendance(Long id, Boolean turnout, String comment) {
        FullTimetable entry = fullTimetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Entry not found"));
        entry.setTurnout(turnout);
        entry.setComment(comment);
        fullTimetableRepository.save(entry);
    }

    private LessonWithAttendanceDto convertToDto(FullTimetable entry) {
    return LessonWithAttendanceDto.builder()
        .id(entry.getId())
        .time(entry.getTime().toString())
        .subject(entry.getSubject())
        .typeSubject(entry.getTypeSubject())
        .teacher(entry.getTeacher())
        .audience(entry.getAudience())
        .turnout(entry.getTurnout())
        .comment(entry.getComment())
        .groupName(entry.getGroupName()) // Добавьте эту строку
        .build();
}
}