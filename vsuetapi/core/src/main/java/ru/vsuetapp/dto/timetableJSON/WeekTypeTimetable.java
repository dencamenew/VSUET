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
public class WeekTypeTimetable {
    private Map<String, DayTimetable> numerator;  // Числитель
    private Map<String, DayTimetable> denominator; // Знаменатель
}
