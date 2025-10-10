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
    private String type;        // тип
    private String name;        // название
    private String teacherName; // имя преподавателя
    private String classroom;   // аудитория
    private String group;       // группа
}
