package ru.practice.teststation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import ru.practice.teststation.dto.TeacherSchuduleDto;
import ru.practice.teststation.repository.FullTimetableRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherSchuduleServise {
    private final FullTimetableRepository fullTimetableRepository;

    public List<TeacherSchuduleDto> getTeacherSchudule(String teacher) {
        return fullTimetableRepository.getTeacherSchudule(teacher);
    }
}
