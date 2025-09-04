package ru.practice.teststation.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GradebookWebSocketController {

    @MessageMapping("/gradebook.updates.{studentId}")
    @SendTo("/topic/gradebook.updates.{studentId}")
    public String handleGradebookUpdate(@DestinationVariable String studentId,
                                        String message) {
        return message;
    }
}