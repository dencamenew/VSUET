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
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class PostgresNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PostgresNotificationService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ObjectMapper objectMapper;

    private volatile boolean running = true;

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
                        stmt.execute("LISTEN timetable_changes");
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
            String channel = notification.getName();
            String parameter = notification.getParameter();

            switch (channel) {
                case "raiting_updates":
                    processRatingUpdate(objectMapper.readTree(parameter));
                    break;
                case "timetable_updates":
                    processTimetableUpdate(objectMapper.readTree(parameter));
                    break;
                case "timetable_changes":
                    processTimetableChanges(parameter);
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

    private void processTimetableChanges(String payload) {
        switch (payload) {
            case "bulk_update_completed":
                messagingTemplate.convertAndSend("/topic/timetable/changes", "full_update");
                logger.info("Full timetable update completed notification sent");
                break;

            case "data_updated":
                messagingTemplate.convertAndSend("/topic/timetable/changes", "data_updated");
                logger.debug("Timetable data updated notification sent");
                break;

            default:
                logger.warn("Unknown timetable_changes payload: {}", payload);
                try {
                    JsonNode json = objectMapper.readTree(payload);
                    messagingTemplate.convertAndSend("/topic/timetable/changes", json);
                    logger.debug("Forwarded JSON notification to timetable/changes topic");
                } catch (Exception e) {
                    messagingTemplate.convertAndSend("/topic/timetable/changes", payload);
                    logger.debug("Forwarded raw notification to timetable/changes topic");
                }
                break;
        }
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