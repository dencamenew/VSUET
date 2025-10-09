package ru.vsuetapp;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import ru.vsuetapp.model.*;
import ru.vsuetapp.model.enums.Role;
import ru.vsuetapp.repository.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // очищает базу после каждого теста
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private GroupsRepository groupsRepository;

    // ==================== CREATE USERS ====================

    @Test
    @DisplayName("Интеграционный тест: создание декана с существующим факультетом")
    void createDeanUser_shouldPersistToDatabase() throws Exception {
        // создаём факультет
        Faculty faculty = facultyRepository.save(Faculty.builder()
                .name("ФКТИ")
                .build());

        // вызываем контроллер
        mockMvc.perform(post("/api/admin/users/create/dean")
                        .param("username", "dean_test")
                        .param("password", "12345")
                        .param("facultyId", faculty.getId().toString())
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("dean_test"))
                .andExpect(jsonPath("$.role").value("DEAN"));

        // проверяем в БД
        User user = userRepository.findByUsername("dean_test").orElseThrow();
        assertThat(user.getRole()).isEqualTo(Role.DEAN);
        assertThat(user.getDeanInfo()).isNotNull();
        assertThat(user.getDeanInfo().getFaculty().getName()).isEqualTo("ФКТИ");
    }

    @Test
    @DisplayName("Интеграционный тест: создание студента с существующей группой")
    void createStudentUser_shouldPersistToDatabase() throws Exception {
        // создаём факультет и группу
        Faculty faculty = facultyRepository.save(Faculty.builder()
                .name("ФКТИ")
                .build());

        Groups group = groupsRepository.save(Groups.builder()
                .groupName("ИС-31")
                .faculty(faculty)
                .build());

        // вызываем контроллер
        mockMvc.perform(post("/api/admin/users/create/student")
                        .param("username", "student_test")
                        .param("password", "1111")
                        .param("groupId", group.getId().toString())
                        .param("zachNumber", "Z999")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("student_test"))
                .andExpect(jsonPath("$.role").value("STUDENT"));

        // проверяем в БД
        User user = userRepository.findByUsername("student_test").orElseThrow();
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
        assertThat(user.getStudentInfo()).isNotNull();
        assertThat(user.getStudentInfo().getZachNumber()).isEqualTo("Z999");
        assertThat(user.getStudentInfo().getGroup().getGroupName()).isEqualTo("ИС-31");
    }

    @Test
    @DisplayName("Интеграционный тест: создание администратора")
    void createAdminUser_shouldPersistToDatabase() throws Exception {
        mockMvc.perform(post("/api/admin/users/create/admin")
                        .param("username", "admin_test")
                        .param("password", "root")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin_test"))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        User user = userRepository.findByUsername("admin_test").orElseThrow();
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
    }

    // ==================== DELETE USERS ====================

    @Test
    @DisplayName("Интеграционный тест: удаление студента")
    void deleteStudentUser_shouldRemoveFromDatabase() throws Exception {
        // создаём факультет, группу и студента
        Faculty faculty = facultyRepository.save(Faculty.builder().name("ФКТИ").build());
        Groups group = groupsRepository.save(Groups.builder().groupName("ИС-32").faculty(faculty).build());
        User user = userRepository.save(User.builder()
                .username("for_delete")
                .passwd("123")
                .role(Role.STUDENT)
                .build());

        // удаляем через контроллер
        mockMvc.perform(delete("/api/admin/users/delete/student/" + user.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Студент и его информация успешно удалены"));

        // проверяем
        assertThat(userRepository.findByUsername("for_delete")).isEmpty();
    }

    @Test
    @DisplayName("Интеграционный тест: удаление декана")
    void deleteDeanUser_shouldRemoveFromDatabase() throws Exception {
        Faculty faculty = facultyRepository.save(Faculty.builder().name("ФКТИ").build());
        User user = userRepository.save(User.builder()
                .username("dean_del")
                .passwd("123")
                .role(Role.DEAN)
                .build());

        mockMvc.perform(delete("/api/admin/users/delete/dean/" + user.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Декан и его информация успешно удалены"));

        assertThat(userRepository.findByUsername("dean_del")).isEmpty();
    }
}
