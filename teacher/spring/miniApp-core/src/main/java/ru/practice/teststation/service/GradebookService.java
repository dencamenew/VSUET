package ru.practice.teststation.service;

import ru.practice.teststation.dto.GradebookUpdateDto;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class GradebookService {

    private final SimpMessagingTemplate messagingTemplate;

    public GradebookService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendGradeUpdate(String studentId, GradebookUpdateDto update) {
        messagingTemplate.convertAndSend(
                "/topic/gradebook.updates." + studentId,
                update
        );
    }
}