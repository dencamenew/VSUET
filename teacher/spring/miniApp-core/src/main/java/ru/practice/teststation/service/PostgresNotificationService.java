package ru.practice.teststation.service;

import org.postgresql.PGConnection;
import org.postgresql.PGNotification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PreDestroy;

@Service
public class PostgresNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PostgresNotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final DataSource dataSource;
    private final ObjectMapper objectMapper;
    private volatile boolean running = true;

    public PostgresNotificationService(SimpMessagingTemplate messagingTemplate,
                                       DataSource dataSource,
                                       ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.dataSource = dataSource;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        startListening();
    }

    private void startListening() {
        new Thread(() -> {
            while (running) {
                try (Connection conn = dataSource.getConnection()) {
                    PGConnection pgConn = conn.unwrap(PGConnection.class);
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute("LISTEN raiting_updates");
                        stmt.execute("LISTEN timetable_updates");
                    }

                    logger.info("Started listening to PostgreSQL notifications");

                    while (running) {
                        PGNotification[] notifications = pgConn.getNotifications(5000);
                        if (notifications != null) {
                            for (PGNotification notification : notifications) {
                                processNotification(notification);
                            }
                        }
                    }
                } catch (SQLException e) {
                    if (running) {
                        logger.error("Database notification error, reconnecting in 5 seconds...", e);
                        sleep(5000);
                    }
                }
            }
            logger.info("Stopped PostgreSQL notification listener");
        }, "PG-Notification-Listener").start();
    }

    private void processNotification(PGNotification notification) {
        try {
            JsonNode json = objectMapper.readTree(notification.getParameter());
            String channel = notification.getName();

            switch (channel) {
                case "raiting_updates":
                    processRatingUpdate(json);
                    break;
                case "timetable_updates":
                    processTimetableUpdate(json);
                    break;
                default:
                    logger.warn("Unknown notification channel: {}", channel);
            }
        } catch (Exception e) {
            logger.error("Error processing notification from channel: {}", notification.getName(), e);
        }
    }

    private void processRatingUpdate(JsonNode json) {
        String zachNumber = json.get("zach_number").asText();
        String groupName = json.get("group_name").asText();
        String subject = json.get("sbj").asText();

        String message = json.toString();

        messagingTemplate.convertAndSend(
                "/topic/raiting.updates.zach." + zachNumber,
                message
        );

        messagingTemplate.convertAndSend(
                "/topic/raiting.updates.group." + groupName,
                message
        );

        logger.debug("Processed rating update for student: {}, subject: {}", zachNumber, subject);
    }

    private void processTimetableUpdate(JsonNode json) {
        String groupName = json.get("group_name").asText();
        String message = json.toString();

        messagingTemplate.convertAndSend(
                "/topic/timetable.updates." + groupName,
                message
        );

        logger.debug("Processed timetable update for group: {}", groupName);
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @PreDestroy
    public void destroy() {
        running = false;
        logger.info("Shutting down PostgreSQL notification listener");
    }
}