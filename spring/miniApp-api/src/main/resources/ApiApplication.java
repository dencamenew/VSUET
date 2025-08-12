package ru.practice.teststation;

import org.springframework.boot.SpringApplication;

@SpringBootApplication
@EnableScheduling
public class ApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiApplication.class, args);
    }
}