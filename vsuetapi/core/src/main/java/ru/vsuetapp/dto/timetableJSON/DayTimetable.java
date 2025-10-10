package ru.vsuetapp.dto.timetableJSON;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayTimetable {
    private Map<String, LessonInfo> schedule; // Время -> Занятие/Занятия
}
