package ru.vsuetapp.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.model.GroupTimetable;
import ru.vsuetapp.model.TeacherTimetable;
import ru.vsuetapp.repository.GroupTimetableRepository;
import ru.vsuetapp.repository.GroupsRepository;
import ru.vsuetapp.repository.TeacherInfoRepository;
import ru.vsuetapp.repository.TeacherTimetableRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final TeacherInfoRepository teacherInfoRepository;
    private final GroupsRepository groupsRepository;


    public Optional<TeacherTimetable> getTeacherTimetable(String teacherName) {
        return teacherInfoRepository.findTimetableByTeacherName(teacherName);
    }

    public Optional<GroupTimetable> getGroupTimetable(String groupName) {
        return groupsRepository.findTimetableByGroupName(groupName);
    }
}
