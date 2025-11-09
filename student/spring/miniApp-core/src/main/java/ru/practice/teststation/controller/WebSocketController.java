package ru.practice.teststation.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/timetable")
    @SendTo("/topic/updates")
    public String handleTimetableUpdate(String message) {
        return "[" + System.currentTimeMillis() + "] " + message;
    }
}