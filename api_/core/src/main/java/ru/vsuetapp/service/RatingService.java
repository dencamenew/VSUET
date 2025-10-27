package ru.vsuetapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.dto.timetableJSON.LessonInfo;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.Rating;
import ru.vsuetapp.repository.RatingRepository;
import ru.vsuetapp.repository.StudentInfoRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final StudentInfoRepository studentInfoRepository;
    private final RatingRepository ratingRepository;
    private final ObjectMapper objectMapper;

    /**
     * Генерация ведомостей рейтинга на основе расписания преподавателя.
     * По каждой уникальной паре (предмет + тип + группа) создаётся одна ведомость с 5 КТ.
     */
    public void generateRatingFromTeacherTimetable(TimetableDto timetableDto, String teacherName) {
        Map<String, LessonInfo> allLessons = new HashMap<>();

        // Собираем все уникальные дисциплины преподавателя из numerator и denominator
        for (Map<String, Map<String, LessonInfo>> weekType : List.of(timetableDto.getNumerator(), timetableDto.getDenominator())) {
            if (weekType == null) continue;
            for (Map.Entry<String, Map<String, LessonInfo>> dayEntry : weekType.entrySet()) {
                for (LessonInfo lesson : dayEntry.getValue().values()) {
                    if (lesson == null || !teacherName.equalsIgnoreCase(lesson.getTeacherName())) continue;
                    String key = lesson.getName() + "|" + lesson.getType() + "|" + lesson.getGroup();
                    allLessons.putIfAbsent(key, lesson);
                }
            }
        }

        List<Rating> ratingsToSave = new ArrayList<>();

        for (LessonInfo lesson : allLessons.values()) {
            String groupName = lesson.getGroup();
            var students = studentInfoRepository.findAllByGroup_GroupName(groupName);
            if (students.isEmpty()) continue;

            List<Map<String, Object>> studentsRatings = new ArrayList<>();
            for (var s : students) {
                // 5 контрольных точек, по умолчанию "-"
                studentsRatings.add(Map.of(
                        "studentId", s.getId().toString(),
                        "rating", List.of("-", "-", "-", "-", "-")
                ));
            }

            try {
                String json = objectMapper.writeValueAsString(Map.of("students", studentsRatings));

                Rating rating = Rating.builder()
                        .teacherName(teacherName)
                        .period("Осенний семестр")
                        .subjectType(lesson.getType())
                        .subjectName(lesson.getName())
                        .groupName(groupName)
                        .reportJson(json)
                        .build();

                ratingsToSave.add(rating);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (!ratingsToSave.isEmpty()) {
            ratingRepository.saveAll(ratingsToSave);
            System.out.println("💾 Сохранено ведомостей рейтинга: " + ratingsToSave.size());
        } else {
            System.out.println("⚠️ Не найдено занятий для преподавателя " + teacherName);
        }
    }

    public List<Map<String, Object>> getGroupRating(String groupName, String subjectName) {
        var ratings = ratingRepository.findByGroupAndSubject(groupName, subjectName);
        if (ratings.isEmpty()) return Collections.emptyList();

        List<Map<String, Object>> result = new ArrayList<>();
        ratings.forEach(r -> {
            try {
                Map<String, Object> parsed = objectMapper.readValue(r.getReportJson(), Map.class);
                result.add(Map.of(
                        "teacherName", r.getTeacherName(),
                        "subjectName", r.getSubjectName(),
                        "subjectType", r.getSubjectType(),
                        "groupName", r.getGroupName(),
                        "ratings", parsed.get("students")
                ));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        return result;
    }
}
