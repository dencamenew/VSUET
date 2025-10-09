package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.model.GroupTimetable;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.repository.GroupTimetableRepository;
import ru.vsuetapp.repository.TeacherTimetableRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final TeacherTimetableRepository teacherTimetableRepository;
    private final GroupTimetableRepository groupTimetableRepository;

    public Optional<TeacherTimetable> getTeacherTimetable(String teacherName) {
        return teacherTimetableRepository.findByTeacherName(teacherName);
    }

    public Optional<GroupTimetable> getGroupTimetable(String groupName) {
        return groupTimetableRepository.findByGroupName(groupName);
    }
}
