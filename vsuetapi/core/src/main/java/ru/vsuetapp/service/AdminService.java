package ru.vsuetapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.vsuetapp.dto.timetableJSON.TimetableDto;
import ru.vsuetapp.model.*;
import ru.vsuetapp.model.enums.Role;
import ru.vsuetapp.repository.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final FacultyRepository facultyRepository;
    private final GroupsRepository groupsRepository;
    private final DeanInfoRepository deanInfoRepository;
    private final StudentInfoRepository studentInfoRepository;
    private final TeacherInfoRepository teacherInfoRepository;
    private final TeacherTimetableRepository teacherTimetableRepository;
    private final GroupTimetableRepository groupTimetableRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Jackson для сериализации/десериализации расписаний
    private final ObjectMapper objectMapper = new ObjectMapper();


    // =============== CREATE USERS ===============
    @Transactional
    public User createDeanUser(String username, String password, String deanName, Long facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new IllegalArgumentException("Факультет не найден"));

        DeanInfo deanInfo = DeanInfo.builder()
                .deanName(deanName)
                .faculty(faculty)
                .build();
        deanInfoRepository.save(deanInfo);

        User user = User.builder()
                .username(username)
                .passwd(passwordEncoder.encode(password))
                .role(Role.DEAN)
                .deanInfo(deanInfo)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User createStudentUser(String username, String password, String studentName, Long groupId, String zachNumber) {
        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Группа не найдена"));

        StudentInfo studentInfo = StudentInfo.builder()
                .studentName(studentName)
                .zachNumber(zachNumber)
                .group(group)
                .build();
        studentInfoRepository.save(studentInfo);

        User user = User.builder()
                .username(username)
                .passwd(passwordEncoder.encode(password))
                .role(Role.STUDENT)
                .studentInfo(studentInfo)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User createTeacherUser(String username, String teacherName, String password) {
        TeacherInfo teacherInfo = TeacherInfo.builder()
                .teacherName(teacherName)
                .build();
        teacherInfoRepository.save(teacherInfo);

        User user = User.builder()
                .username(username)
                .passwd(passwordEncoder.encode(password))
                .role(Role.TEACHER)
                .teacherInfo(teacherInfo)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User createAdminUser(String username, String password) {
        User user = User.builder()
                .username(username)
                .passwd(passwordEncoder.encode(password))
                .role(Role.ADMIN)
                .build();
        return userRepository.save(user);
    }

    // ======================================================
    //                  DELETE USERS
    // ======================================================
    @Transactional
    public void deleteDeanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (user.getDeanInfo() != null) {
            deanInfoRepository.delete(user.getDeanInfo());
        }
        userRepository.delete(user);
    }

    @Transactional
    public void deleteStudentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (user.getStudentInfo() != null) {
            studentInfoRepository.delete(user.getStudentInfo());
        }
        userRepository.delete(user);
    }

    @Transactional
    public void deleteTeacherUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (user.getTeacherInfo() != null) {
            teacherInfoRepository.delete(user.getTeacherInfo());
        }
        userRepository.delete(user);
    }

    @Transactional
    public void deleteAdminUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Пользователь не является администратором");
        }

        userRepository.delete(user);
    }

    // ======================================================
    //                  TIMETABLES
    // ======================================================

    /**
     * Создание расписания преподавателя (TeacherTimetable)
     */
    @Transactional
    public TeacherTimetable createTeacherTimetable(Long teacherId, TimetableDto timetableDto) {
        TeacherInfo teacher = teacherInfoRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Преподаватель не найден"));

        String timetableJson;
        try {
            timetableJson = objectMapper.writeValueAsString(timetableDto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка сериализации расписания преподавателя", e);
        }

        TeacherTimetable timetable = TeacherTimetable.builder()
                .teacherInfo(teacher)
                .timetableJson(timetableJson)
                .build();

        return teacherTimetableRepository.save(timetable);
    }

    /**
     * Создание расписания группы (GroupTimetable)
     */
    @Transactional
    public GroupTimetable createStudentTimetable(Long groupId, TimetableDto timetableDto) {
        Groups group = groupsRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Группа не найдена"));

        String timetableJson;
        try {
            timetableJson = objectMapper.writeValueAsString(timetableDto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Ошибка сериализации расписания группы", e);
        }

        GroupTimetable timetable = GroupTimetable.builder()
                .group(group)
                .timetableJson(timetableJson)
                .build();

        return groupTimetableRepository.save(timetable);
    }

    /**
     * Удаление расписания преподавателя
     */
    @Transactional
    public void deleteTeacherTimetable(Long teacherId) {
        TeacherInfo teacher = teacherInfoRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Преподаватель не найден"));

        TeacherTimetable timetable = teacher.getTimetable();
        if (timetable != null) {
            teacherTimetableRepository.delete(timetable);
            teacher.setTimetable(null);
            teacherInfoRepository.save(teacher);
        }
    }

    /**
     * Удаление расписания группы
     */
    @Transactional
    public void deleteStudentTimetable(Long groupId) {
        GroupTimetable timetable = groupTimetableRepository.findByGroupId(groupId);
        if (timetable != null) {
            groupTimetableRepository.delete(timetable);
        }
    }
}
