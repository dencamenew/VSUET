package ru.vsuetapp.service;

import java.util.List;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import ru.vsuetapp.model.DeanInfo;
import ru.vsuetapp.model.Groups;
import ru.vsuetapp.model.StudentInfo;
import ru.vsuetapp.repository.DeanInfoRepository;
import ru.vsuetapp.repository.GroupsRepository;
import ru.vsuetapp.repository.StudentInfoRepository;

@Service
@RequiredArgsConstructor
public class DeanInfoService {

    private final DeanInfoRepository deanInfoRepository;
    private final GroupsRepository groupsRepository;
    private final StudentInfoRepository studentInfoRepository;

    /**
     * Получить все группы факультета, где работает декан
     */
    public List<Groups> getAllGroupsByDean(Long deanId) {
        DeanInfo dean = deanInfoRepository.findById(deanId)
                .orElseThrow(() -> new IllegalArgumentException("Декан не найден"));

        return groupsRepository.findAllByFaculty_Id(dean.getFaculty().getId());
    }

    /**
     * Создать новую группу на факультете декана
     */
    @Transactional
    public Groups createGroup(Long deanId, String groupName) {
        DeanInfo dean = deanInfoRepository.findById(deanId)
                .orElseThrow(() -> new IllegalArgumentException("Декан не найден"));

        Groups group = Groups.builder()
                .group_name(groupName)
                .faculty(dean.getFaculty())
                .build();

        return groupsRepository.save(group);
    }

    /**
     * Удалить группу (только если она принадлежит факультету декана)
     */
    @Transactional
    public void deleteGroup(Long deanId, Long groupId) {
        DeanInfo dean = deanInfoRepository.findById(deanId)
                .orElseThrow(() -> new IllegalArgumentException("Декан не найден"));

        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Группа не найдена"));

        if (!group.getFaculty().getId().equals(dean.getFaculty().getId())) {
            throw new SecurityException("Нельзя удалить группу другого факультета");
        }

        groupsRepository.delete(group);
    }

    /**
     * Получить всех студентов конкретной группы (для декана)
     */
    public List<StudentInfo> getAllStudentsInGroup(Long deanId, Long groupId) {
        DeanInfo dean = deanInfoRepository.findById(deanId)
                .orElseThrow(() -> new IllegalArgumentException("Декан не найден"));

        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Группа не найдена"));

        if (!group.getFaculty().getId().equals(dean.getFaculty().getId())) {
            throw new SecurityException("Группа не принадлежит факультету этого декана");
        }

        return studentInfoRepository.findAllByGroup_Id(groupId);
    }

    /**
     * Создать студента в конкретной группе факультета декана
     */
    @Transactional
    public StudentInfo createStudentInGroup(Long deanId, Long groupId, String studentName, String zachNumber) {
        DeanInfo dean = deanInfoRepository.findById(deanId)
                .orElseThrow(() -> new IllegalArgumentException("Декан не найден"));

        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Группа не найдена"));

        if (!group.getFaculty().getId().equals(dean.getFaculty().getId())) {
            throw new SecurityException("Нельзя добавлять студентов в группу другого факультета");
        }

        StudentInfo student = StudentInfo.builder()
                .student_name(studentName)
                .zach_number(zachNumber)
                .group(group)
                .build();

        return studentInfoRepository.save(student);
    }

    /**
     * Удалить студента (только если он принадлежит факультету декана)
     */
    @Transactional
    public void deleteStudent(Long deanId, Long studentId) {
        DeanInfo dean = deanInfoRepository.findById(deanId)
                .orElseThrow(() -> new IllegalArgumentException("Декан не найден"));

        StudentInfo student = studentInfoRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Студент не найден"));

        if (!student.getGroup().getFaculty().getId().equals(dean.getFaculty().getId())) {
            throw new SecurityException("Нельзя удалять студентов другого факультета");
        }

        studentInfoRepository.delete(student);
    }
}
