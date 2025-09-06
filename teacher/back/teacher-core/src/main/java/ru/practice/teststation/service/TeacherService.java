package ru.practice.teststation.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import ru.practice.teststation.repository.TeacherInfoRepository;
import ru.practice.teststation.repository.TeacherSchuduleRepository;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherInfoRepository teacherInfoRepository;
    private final TeacherSchuduleRepository teacherSchuduleRepository;

    
}
