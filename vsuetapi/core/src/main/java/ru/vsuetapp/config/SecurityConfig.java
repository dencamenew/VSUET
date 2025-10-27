package ru.vsuetapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    public SecurityConfig() {
        System.out.println(">>> SecurityConfig loaded!");
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)           // отключаем CSRF
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()           // разрешаем всё
                )
                .formLogin(AbstractHttpConfigurer::disable)    // убираем форму логина
                .httpBasic(AbstractHttpConfigurer::disable);   // убираем Basic Auth

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
