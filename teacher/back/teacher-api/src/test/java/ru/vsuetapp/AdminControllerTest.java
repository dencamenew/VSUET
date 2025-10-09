package ru.vsuetapp;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import ru.vsuetapp.controller.AdminController;
import ru.vsuetapp.model.enums.Role;
import ru.vsuetapp.model.User;
import ru.vsuetapp.service.AdminService;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(AdminController.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    // ==================== CREATE USERS ====================

    @Test
    @DisplayName("Создание декана")
    void createDeanUser_shouldReturnOk() throws Exception {
        User mockUser = User.builder().id(1L).username("dean1").role(Role.DEAN).build();
        Mockito.when(adminService.createDeanUser(anyString(), anyString(), anyLong())).thenReturn(mockUser);

        mockMvc.perform(post("/api/admin/users/create/dean")
                        .param("username", "dean1")
                        .param("password", "12345")
                        .param("facultyId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("dean1"))
                .andExpect(jsonPath("$.role").value("DEAN"));
    }

    @Test
    @DisplayName("Создание студента")
    void createStudentUser_shouldReturnOk() throws Exception {
        User mockUser = User.builder().id(2L).username("ivanov").role(Role.STUDENT).build();
        Mockito.when(adminService.createStudentUser(anyString(), anyString(), anyLong(), anyString())).thenReturn(mockUser);

        mockMvc.perform(post("/api/admin/users/create/student")
                        .param("username", "ivanov")
                        .param("password", "1111")
                        .param("groupId", "5")
                        .param("zachNumber", "Z123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("ivanov"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @DisplayName("Создание администратора")
    void createAdminUser_shouldReturnOk() throws Exception {
        User mockUser = User.builder().id(4L).username("superadmin").role(Role.ADMIN).build();
        Mockito.when(adminService.createAdminUser(anyString(), anyString())).thenReturn(mockUser);

        mockMvc.perform(post("/api/admin/users/create/admin")
                        .param("username", "superadmin")
                        .param("password", "adminpass"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("superadmin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    // ==================== DELETE USERS ====================

    @Test
    @DisplayName("Удаление декана")
    void deleteDeanUser_shouldReturnOk() throws Exception {
        mockMvc.perform(delete("/api/admin/users/delete/dean/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Декан и его информация успешно удалены"));

        Mockito.verify(adminService).deleteDeanUser(1L);
    }

    @Test
    @DisplayName("Удаление студента")
    void deleteStudentUser_shouldReturnOk() throws Exception {
        mockMvc.perform(delete("/api/admin/users/delete/student/2"))
                .andExpect(status().isOk())
                .andExpect(content().string("Студент и его информация успешно удалены"));

        Mockito.verify(adminService).deleteStudentUser(2L);
    }
}
