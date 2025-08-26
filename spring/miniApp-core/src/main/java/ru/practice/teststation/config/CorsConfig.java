package ru.practice.teststation.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Разрешаем credentials
        config.setAllowCredentials(true);

        // Разрешаем конкретные origin'ы
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        List<String> allowedOrigins;

        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            allowedOrigins = Arrays.asList(allowedOriginsEnv.split(","));
        } else {
            // Fallback для разработки
            allowedOrigins = Arrays.asList(
                    "https://webvsuet.cloudpub.ru",
                    "http://localhost:3000",
                    "http://localhost:8080"
            );
        }

        config.setAllowedOrigins(allowedOrigins);

        // Разрешаем все методы
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));

        // Разрешаем все заголовки
        config.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-Requested-With"
        ));

        // Экспозиция заголовков
        config.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization"
        ));

        // Максимальное время кэширования preflight запроса
        config.setMaxAge(3600L);

        // Применяем ко всем путям
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}