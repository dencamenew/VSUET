package ru.practice.teststation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.practice.teststation.dto.*;
import ru.practice.teststation.exception.StudentNotFoundException;
import ru.practice.teststation.model.*;
import ru.practice.teststation.repository.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final ZachRepository zachRepository;
    private final RatingRepository ratingRepository;
    private final TimetableRepository timetableRepository;
    private final FullTimetableRepository fullTimetableRepository;
    private final TimetableWithZachRepository timetableWithZachRepository;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    // Получение информации о студенте
    public StudentInfoDto getStudentInfo(String zachNumber) {
        Zach zach = getZachByNumber(zachNumber);
        List<Rating> ratings = getRatingsByZachNumber(zachNumber);
        String timetableJson = timetableRepository.findTimetableJsonByGroupName(zach.getGroupName())
                .orElseThrow(() -> new RuntimeException("Расписание не найдено для группы: " + zach.getGroupName()));

        JsonNode timetableData;
        try {
            timetableData = objectMapper.readTree(timetableJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка при парсинге расписания для группы: " + zach.getGroupName(), e);
        }

        return StudentInfoDto.builder()
                .zachNumber(zach.getZachNumber())
                .groupName(zach.getGroupName())
                .ratings(convertToRatingDtos(ratings))
                .timetable(timetableData)
                .build();
    }

    // Метод для получения расписания
    public TimetableResponseDto getTimetable(String zachNumber) {
        Zach zach = getZachByNumber(zachNumber);
        JsonNode timetableData = getTimetableByGroup(zach.getGroupName());

        return TimetableResponseDto.builder()
                .zachNumber(zach.getZachNumber())
                .groupName(zach.getGroupName())
                .timetable(timetableData)
                .build();
    }

    // Метод для получения рейтинга
    public RatingResponseDto getRatings(String zachNumber) {
        Zach zach = getZachByNumber(zachNumber);
        List<Rating> ratings = getRatingsByZachNumber(zachNumber);

        return RatingResponseDto.builder()
                .zachNumber(zach.getZachNumber())
                .groupName(zach.getGroupName())
                .ratings(convertToRatingDtos(ratings))
                .build();
    }

    // Метод для получения расписания с посещаемостью по дате и номеру зачётки
    public TimetableWithAttendanceDto getTimetableWithAttendance(LocalDate date, String zachNumber) {
        log.info("Searching timetable for date: {}, zachNumber: {}", date, zachNumber);

        // Получаем расписание с посещаемостью
        List<FullTimetable> timetableEntries = fullTimetableRepository.findByDateAndZachNumber(date, zachNumber);
        log.info("Found {} timetable entries for date {} and zachNumber {}",
                timetableEntries.size(), date, zachNumber);

        // Преобразуем в DTO с информацией об аудитории
        List<LessonWithAttendanceDto> lessons = timetableEntries.stream()
                .map(entry -> convertToLessonDto(entry, date))
                .collect(Collectors.toList());

        return TimetableWithAttendanceDto.builder()
                .zachNumber(zachNumber)
                .timetable(lessons)
                .build();
    }

    private LessonWithAttendanceDto convertToLessonDto(FullTimetable entry, LocalDate date) {
        // Получаем информацию об аудитории по номеру зачётки и предмету
        String audience = findAudienceForLesson(entry.getZachNumber(), entry.getSubject(), entry.getTime(), date);

        return LessonWithAttendanceDto.builder()
                .date(entry.getDate().toString())
                .time(entry.getTime().toString())
                .subject(entry.getSubject())
                .teacher(entry.getTeacher())
                .audience(audience)
                .turnout(entry.getTurnout())
                .comment(entry.getComment()) // Добавлено поле comment
                .build();
    }

    private String findAudienceForLesson(String zachNumber, String subject, LocalTime time, LocalDate date) {
        // Определяем тип недели (числитель/знаменатель)
        String weekType = determineWeekType(date);

        log.debug("Searching audience for zachNumber: {}, subject: {}, time: {}, weekType: {}",
                zachNumber, subject, time, weekType);

        // Ищем аудиторию в timetable_with_zach по номеру зачётки и предмету
        List<TimetableWithZach> timetableEntries = timetableWithZachRepository.findByZachNumberAndSubjectAndTimeAndWeekType(
                zachNumber, subject, time, weekType);

        // Если не нашли для текущего типа недели, ищем "всегда"
        if (timetableEntries.isEmpty()) {
            timetableEntries = timetableWithZachRepository.findByZachNumberAndSubjectAndTimeAndWeekType(
                    zachNumber, subject, time, "всегда");
        }

        // Если не нашли по времени, ищем только по номеру зачётки и предмету (без времени)
        if (timetableEntries.isEmpty()) {
            timetableEntries = timetableWithZachRepository.findByZachNumberAndSubject(zachNumber, subject);
            log.debug("Found {} entries without time filter for zachNumber: {}, subject: {}",
                    timetableEntries.size(), zachNumber, subject);
        }

        // Если нашли записи, возвращаем первую аудиторию
        if (!timetableEntries.isEmpty()) {
            String audience = timetableEntries.get(0).getAudience();
            log.debug("Found audience: {} for zachNumber: {}, subject: {}, time: {}",
                    audience, zachNumber, subject, time);
            return audience;
        }

        log.debug("No audience found for zachNumber: {}, subject: {}, time: {}", zachNumber, subject, time);
        return null;
    }

    private String determineWeekType(LocalDate date) {
        // Определение типа недели (числитель/знаменатель)
        int weekOfYear = date.get(WeekFields.ISO.weekOfYear());
        return weekOfYear % 2 == 0 ? "числитель" : "знаменатель";
    }

    // Вспомогательные методы
    private Zach getZachByNumber(String zachNumber) {
        return zachRepository.findByZachNumber(zachNumber)
                .orElseThrow(() -> new StudentNotFoundException("Студент не найден"));
    }

    private List<Rating> getRatingsByZachNumber(String zachNumber) {
        return ratingRepository.findByZachNumber(zachNumber);
    }

    private JsonNode getTimetableByGroup(String groupName) {
        String timetableJson = timetableRepository.findTimetableJsonByGroupName(groupName)
                .orElseThrow(() -> new RuntimeException("Расписание не найдено для группы: " + groupName));

        try {
            return objectMapper.readTree(timetableJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка при парсинге расписания для группы: " + groupName, e);
        }
    }

    private List<RatingDto> convertToRatingDtos(List<Rating> ratings) {
        return ratings.stream()
                .map(r -> RatingDto.builder()
                        .subject(r.getSubject())
                        .vedType(r.getVedType())
                        .ratings(r.getRatings())
                        .build())
                .collect(Collectors.toList());
    }

    // Метод для отладки - получение всех записей по номеру зачётки
    public List<FullTimetable> getDebugTimetable(String zachNumber) {
        return fullTimetableRepository.findByZachNumber(zachNumber);
    }

    @Transactional
    public void updateComment(Long id, String comment) {
        FullTimetable entry = fullTimetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запись не найдена"));
        entry.setComment(comment);
        fullTimetableRepository.save(entry);

        // Отправляем уведомление через WebSocket
        messagingTemplate.convertAndSend("/topic/timetable/updates",
                Map.of("type", "comment_updated", "id", id, "comment", comment));
    }

    // Метод для обновления посещаемости и комментария с WebSocket уведомлением
    @Transactional
    public void updateAttendance(Long id, Boolean turnout, String comment) {
        FullTimetable entry = fullTimetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запись не найдена"));
        entry.setTurnout(turnout);
        entry.setComment(comment);
        fullTimetableRepository.save(entry);

        // Отправляем уведомление через WebSocket
        messagingTemplate.convertAndSend("/topic/timetable/updates",
                Map.of("type", "attendance_updated", "id", id, "turnout", turnout, "comment", comment));
    }
}