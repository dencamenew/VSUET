package ru.practice.teststation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.practice.teststation.dto.*;
import ru.practice.teststation.exception.StudentNotFoundException;
import ru.practice.teststation.model.*;
import ru.practice.teststation.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final ZachRepository zachRepository;
    private final RatingRepository ratingRepository;
    private final TimetableRepository timetableRepository;
    private final SbjUrlsRepository sbjUrlsRepository;
    private final ObjectMapper objectMapper;

    // Получение информации о студенте (возможно, вам это больше не нужно)
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

    // Новый метод для получения только расписания
    public TimetableResponseDto getTimetable(String zachNumber) {
        Zach zach = getZachByNumber(zachNumber);
        JsonNode timetableData = getTimetableByGroup(zach.getGroupName());

        return TimetableResponseDto.builder()
                .zachNumber(zach.getZachNumber())
                .groupName(zach.getGroupName())
                .timetable(timetableData)
                .build();
    }

    // Новый метод для получения только рейтинга
    public RatingResponseDto getRatings(String zachNumber) {
        Zach zach = getZachByNumber(zachNumber);
        List<Rating> ratings = getRatingsByZachNumber(zachNumber);

        return RatingResponseDto.builder()
                .zachNumber(zach.getZachNumber())
                .groupName(zach.getGroupName())
                .ratings(convertToRatingDtos(ratings))
                .build();
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
}