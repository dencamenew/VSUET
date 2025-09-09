package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.practice.teststation.dto.TimetableWithAttendanceDto;
import ru.practice.teststation.dto.LessonWithAttendanceDto;
import ru.practice.teststation.model.FullTimetable;
import ru.practice.teststation.repository.FullTimetableRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final FullTimetableRepository fullTimetableRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TimetableWithAttendanceDto getTimetableWithAttendance(LocalDate date, String zachNumber) {
        log.info("Searching timetable for date: {}, zachNumber: {}", date, zachNumber);

        List<FullTimetable> timetableEntries = fullTimetableRepository.findByDateAndZachNumber(date, zachNumber);
        log.info("Found {} timetable entries", timetableEntries.size());

        List<LessonWithAttendanceDto> lessons = timetableEntries.stream()
                .map(this::convertToLessonDto)
                .collect(Collectors.toList());


        return TimetableWithAttendanceDto.builder()
                .zachNumber(zachNumber)
                .date(date.toString())
                .timetable(lessons)
                .build();
    }

    public TimetableWithAttendanceDto getTimetable(String zachNumber) {
        return getTimetableWithAttendance(LocalDate.now(), zachNumber);
    }

    private LessonWithAttendanceDto convertToLessonDto(FullTimetable entry) {
        return LessonWithAttendanceDto.builder()
                .id(entry.getId())
                .date(entry.getDate().toString())
                .time(entry.getTime().toString())
                .subject(entry.getSubject())
                .typeSubject(entry.getTypeSubject())
                .teacher(entry.getTeacher())
                .audience(entry.getAudience())
                .turnout(entry.getTurnout() != null ? entry.getTurnout() : false)
                .comment(entry.getComment())
                .build();
    }

    public List<FullTimetable> getDebugTimetable(String zachNumber) {
        return fullTimetableRepository.findByZachNumber(zachNumber);
    }

    @Transactional
    public void updateComment(Long id, String comment) {
        FullTimetable entry = fullTimetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запись не найдена"));
        entry.setComment(comment);
        fullTimetableRepository.save(entry);

        messagingTemplate.convertAndSend("/topic/timetable/updates",
                Map.of("type", "comment_updated", "id", id, "comment", comment));
    }

    @Transactional
    public void updateAttendance(Long id, Boolean turnout, String comment) {
        FullTimetable entry = fullTimetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запись не найдена"));
        entry.setTurnout(turnout);
        entry.setComment(comment);
        fullTimetableRepository.save(entry);

        messagingTemplate.convertAndSend("/topic/timetable/updates",
                Map.of("type", "attendance_updated", "id", id, "turnout", turnout, "comment", comment));
    }
}