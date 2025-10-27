package ru.vsuetapp;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import ru.vsuetapp.model.User;
import ru.vsuetapp.model.enums.Role;
import ru.vsuetapp.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static final String BASE_URL = "/api/admin/users";

    @Test
    @Order(1)
    @DisplayName("Создание пользователя — успешный сценарий")
    void createUser_success() throws Exception {
        User user = User.builder()
                .username("test_user")
                .passwd("12345")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("test_user"))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        assertThat(userRepository.findByUsername("test_user")).isPresent();
    }

    @Test
    @Order(2)
    @DisplayName("Создание пользователя — уже существует")
    void createUser_alreadyExists() throws Exception {
        // предварительно создать пользователя
        userRepository.save(User.builder()
                .username("duplicate_user")
                .passwd("12345")
                .role(Role.STUDENT)
                .build());

        User user = User.builder()
                .username("duplicate_user")
                .passwd("54321")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(3)
    @DisplayName("Удаление пользователя — успешное удаление")
    void deleteUser_success() throws Exception {
        User user = userRepository.save(User.builder()
                .username("user_to_delete")
                .passwd("123")
                .role(Role.TEACHER)
                .build());

        mockMvc.perform(delete(BASE_URL + "/" + user.getId()))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

    @Test
    @Order(4)
    @DisplayName("Удаление пользователя — не найден")
    void deleteUser_notFound() throws Exception {
        mockMvc.perform(delete(BASE_URL + "/999999"))
                .andExpect(status().isNotFound());
    }
}
