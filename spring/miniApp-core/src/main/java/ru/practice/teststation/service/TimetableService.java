package ru.practice.teststation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.practice.teststation.dto.TimetableResponse;
import ru.practice.teststation.exception.StudentNotFoundException;
import ru.practice.teststation.model.Zach;
import ru.practice.teststation.repository.ZachRepository;
import ru.practice.teststation.repository.TimetableRepository;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final ZachRepository zachRepository;
    private final TimetableRepository timetableRepository;
    private final ObjectMapper objectMapper;

    public TimetableResponse getTimetable(String zachNumber) {
        Zach zach = zachRepository.findByZachNumber(zachNumber)
                .orElseThrow(() -> new StudentNotFoundException("Студент не найден"));

        String timetableJson = timetableRepository.findTimetableJsonByGroupName(zach.getGroupName())
                .orElseThrow(() -> new RuntimeException("Расписание не найдено для группы: " + zach.getGroupName()));

        try {
            JsonNode timetableData = objectMapper.readTree(timetableJson);

            return TimetableResponse.builder()
                    .zachNumber(zach.getZachNumber())
                    .groupName(zach.getGroupName())
                    .timetable(timetableData)
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка при парсинге расписания", e);
        }
    }
}