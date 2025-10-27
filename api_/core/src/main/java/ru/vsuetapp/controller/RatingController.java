package ru.vsuetapp.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.repository.TeacherInfoRepository;
import ru.vsuetapp.service.RatingService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/rating")
public class RatingController {

    private final RatingService ratingService;
    private final TeacherInfoRepository teacherInfoRepository;

    // 👩‍🏫 Генерация ведомостей рейтинга
    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestParam String teacherName) {
        TimetableDto timetable = teacherInfoRepository.findTimetableByTeacherName(teacherName)
                .map(TeacherTimetable::getTimetableJsonDto)
                .orElseThrow(() -> new RuntimeException("Расписание преподавателя не найдено"));

        ratingService.generateRatingFromTeacherTimetable(timetable, teacherName);
        return ResponseEntity.ok("Ведомости рейтинга успешно сгенерированы");
    }

    // 📊 Получить рейтинг группы по предмету
    @GetMapping("/group")
    public ResponseEntity<List<Map<String, Object>>> getGroupRating(
            @RequestParam String groupName,
            @RequestParam String subjectName) {
        return ResponseEntity.ok(ratingService.getGroupRating(groupName, subjectName));
    }
}
