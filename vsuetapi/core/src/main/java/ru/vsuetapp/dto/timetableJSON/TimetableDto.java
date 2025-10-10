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
public class TimetableDto {
    private Map<String, Map<String, LessonInfo>> denominator; // dayOfWeek -> time -> lesson
    private Map<String, Map<String, LessonInfo>> numerator;   // dayOfWeek -> time -> lesson
}

