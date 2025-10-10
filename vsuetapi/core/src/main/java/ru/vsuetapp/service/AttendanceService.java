package ru.vsuetapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.dto.attendanceReportJSON.AttendanceReportDTO;
import ru.vsuetapp.dto.attendanceReportJSON.StudentAttendanceDTO;
import ru.vsuetapp.dto.timetableJSON.*;
import ru.vsuetapp.model.Attendance;
import ru.vsuetapp.model.enums.AttendanceStatus;
import ru.vsuetapp.repository.AttendanceRepository;
import ru.vsuetapp.repository.StudentInfoRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final StudentInfoRepository studentInfoRepository;
    private final AttendanceRepository attendanceRepository;
    private final ObjectMapper objectMapper;

    public void generateAttendanceFromTeacherTimetable(TimetableDto timetableDto, String teacherName) {
        LocalDate start = LocalDate.of(LocalDate.now().getYear(), 9, 1);
        LocalDate end = LocalDate.of(LocalDate.now().getYear(), 12, 31);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        System.out.println("▶️ Генерация ведомости для преподавателя: " + teacherName);
        System.out.println("🗓️ Период: " + start + " - " + end);

        List<Attendance> generatedReports = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            boolean isNumerator = (date.get(ChronoField.ALIGNED_WEEK_OF_YEAR) % 2 == 0);
            String weekType = isNumerator ? "numerator" : "denominator";

            System.out.println("\n📅 Проверка даты: " + date + " (" + dayOfWeek + "), тип недели: " + weekType);

            // Выбираем нужную часть расписания
            Map<String, Map<String, LessonInfo>> currentWeekMap =
                    isNumerator ? timetableDto.getNumerator() : timetableDto.getDenominator();

            if (currentWeekMap == null || currentWeekMap.isEmpty()) {
                System.out.println("⚠️ Нет данных для недели: " + weekType);
                continue;
            }

            Map<String, LessonInfo> lessonsForDay = currentWeekMap.get(dayOfWeek.name().toLowerCase());
            if (lessonsForDay == null || lessonsForDay.isEmpty()) {
                System.out.println("⚠️ Нет расписания для дня: " + dayOfWeek.name().toLowerCase());
                continue;
            }

            System.out.println("✅ Найдено занятий в день " + dayOfWeek + ": " + lessonsForDay.size());

            // цикл по каждой паре (time -> lesson)
            for (Map.Entry<String, LessonInfo> entry : lessonsForDay.entrySet()) {
                String time = entry.getKey();
                LessonInfo lesson = entry.getValue();

                if (lesson == null) continue;
                if (lesson.getTeacherName() == null ||
                        !teacherName.equalsIgnoreCase(lesson.getTeacherName())) {
                    System.out.println("⏭ Преподаватель урока (" + lesson.getTeacherName() + ") не совпадает с текущим (" + teacherName + ")");
                    continue;
                }

                System.out.println("🎓 Обработка занятия: " + lesson.getName()
                        + " (" + lesson.getType() + "), группа: " + lesson.getGroup()
                        + ", время: " + time + ", аудитория: " + lesson.getClassroom());

                String groupName = lesson.getGroup();
                var studentsList = studentInfoRepository.findAllByGroup_GroupName(groupName);

                if (studentsList == null || studentsList.isEmpty()) {
                    System.out.println("⚠️ Не найдено студентов в группе: " + groupName);
                    continue;
                }

                System.out.println("👥 Найдено студентов в группе " + groupName + ": " + studentsList.size());

                List<StudentAttendanceDTO> students = new ArrayList<>();
                for (var student : studentsList) {
                    Map<String, AttendanceStatus> attendanceMap = new HashMap<>();
                    attendanceMap.put(date.format(formatter), AttendanceStatus.ABSENT);
                    students.add(new StudentAttendanceDTO(String.valueOf(student.getId()), attendanceMap));
                }

                try {
                    String reportJson = objectMapper.writeValueAsString(
                            AttendanceReportDTO.builder().students(students).build()
                    );

                    Attendance attendance = Attendance.builder()
                            .teacherName(teacherName)
                            .period("Осенний семестр")
                            .subjectType(lesson.getType())
                            .subjectName(lesson.getName())
                            .day(date.format(formatter))
                            .time(time)
                            .groupName(groupName)
                            .reportJson(reportJson)
                            .build();

                    generatedReports.add(attendance);
                    System.out.println("✅ Добавлена ведомость: " + lesson.getName() + " (" + date + " " + time + ")");
                } catch (Exception e) {
                    System.out.println("❌ Ошибка сериализации JSON для урока " + lesson.getName() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        if (!generatedReports.isEmpty()) {
            attendanceRepository.saveAll(generatedReports);
            System.out.println("💾 Сохранено ведомостей: " + generatedReports.size());
        } else {
            System.out.println("⚠️ Не найдено занятий для создания ведомости у преподавателя: " + teacherName);
        }
    }
}

