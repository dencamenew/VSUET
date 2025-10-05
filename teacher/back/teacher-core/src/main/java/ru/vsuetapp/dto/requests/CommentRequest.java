package ru.vsuetapp.dto.requests;

import lombok.Data;

@Data
public class CommentRequest {
    private String subject;
    private String groupName;
    private String time;
    private String date;
    private String teacher;
    private String comment;
}