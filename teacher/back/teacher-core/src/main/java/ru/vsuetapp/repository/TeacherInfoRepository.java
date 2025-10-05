package ru.vsuetapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.vsuetapp.model.TeacherInfo;

import java.util.Optional;

public interface TeacherInfoRepository extends JpaRepository<TeacherInfo, Long> {
    
    // Поиск по имени пользователя
    Optional<TeacherInfo> findByName(String name);
    
    // Кастомный запрос для проверки логина и пароля
    @Query("SELECT t FROM TeacherInfo t WHERE t.name = :name AND t.password = :password")
    Optional<TeacherInfo> checkLogin(@Param("name") String name, 
                                   @Param("password") String password);
    
    // Проверка существования пользователя
    boolean existsByName(String name);
}