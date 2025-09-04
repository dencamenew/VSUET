package ru.practice.teststation.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    private static final Logger logger = LoggerFactory.getLogger(CorsConfig.class);

    @Bean
    public CorsFilter corsFilter() {
        logger.debug("Initializing CORS filter...");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Разрешаем credentials
        config.setAllowCredentials(true);
        logger.debug("CORS credentials allowed: true");

        // Разрешаем конкретные origin'ы
        String allowedOriginsEnv = System.getenv("CORS_ALLOWED_ORIGINS");
        List<String> allowedOrigins;

        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            allowedOrigins = Arrays.asList(allowedOriginsEnv.split(","));
            logger.info("CORS allowed origins from environment: {}", allowedOrigins);
        } else {
            // Fallback для разработки
            allowedOrigins = Arrays.asList(
                    "https://vsuet-app-v1.2.cloudpub.ru",
                    "http://localhost:3000",
                    "http://localhost:8080"
            );
            logger.warn("CORS_ALLOWED_ORIGINS environment variable not set, using fallback origins: {}", allowedOrigins);
        }

        config.setAllowedOrigins(allowedOrigins);

        // Разрешаем все методы
        List<String> allowedMethods = Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD");
        config.setAllowedMethods(allowedMethods);
        logger.debug("CORS allowed methods: {}", allowedMethods);

        // Разрешаем все заголовки
        List<String> allowedHeaders = Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-Requested-With"
        );
        config.setAllowedHeaders(allowedHeaders);
        logger.debug("CORS allowed headers: {}", allowedHeaders);

        // Экспозиция заголовков
        List<String> exposedHeaders = Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization"
        );
        config.setExposedHeaders(exposedHeaders);
        logger.debug("CORS exposed headers: {}", exposedHeaders);

        // Максимальное время кэширования preflight запроса
        config.setMaxAge(3600L);
        logger.debug("CORS max age: 3600 seconds");

        // Применяем ко всем путям
        source.registerCorsConfiguration("/**", config);
        logger.info("CORS configuration applied to all paths (/**)");

        logger.info("CORS filter initialized successfully with {} allowed origins", allowedOrigins.size());
        
        return new CorsFilter(source);
    }
}