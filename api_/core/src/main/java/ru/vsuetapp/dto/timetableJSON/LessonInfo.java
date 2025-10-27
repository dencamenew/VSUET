package ru.vsuetapp.dto.timetableJSON;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonInfo {
    private String type;        // лекция, практика и т.д.
    private String name;        // предмет
    private String teacherName; // преподаватель
    private String classroom;   // аудитория
    private String group;       // группа
}
