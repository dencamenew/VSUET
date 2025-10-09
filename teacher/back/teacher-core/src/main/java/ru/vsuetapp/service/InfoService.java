package ru.vsuetapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.vsuetapp.model.DeanInfo;
import ru.vsuetapp.model.StudentInfo;
import ru.vsuetapp.model.TeacherInfo;
import ru.vsuetapp.repository.DeanInfoRepository;
import ru.vsuetapp.repository.StudentInfoRepository;
import ru.vsuetapp.repository.TeacherInfoRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InfoService {

    private final DeanInfoRepository deanInfoRepository;
    private final TeacherInfoRepository teacherInfoRepository;
    private final StudentInfoRepository studentInfoRepository;

    public Optional<DeanInfo> getDeanInfoByName(String name) {
        return deanInfoRepository.findByDeanName(name);
    }

    public Optional<TeacherInfo> getTeacherInfoByName(String name) {
        return teacherInfoRepository.findByTeacherName(name);
    }

    public Optional<StudentInfo> getStudentInfoByZachNumber(String zachNumber) {
        return studentInfoRepository.findByZachNumber(zachNumber);
    }

    public Optional<StudentInfo> getStudentInfoByName(String name) {
        return studentInfoRepository.findByStudentName(name);
    }
}
