package com.medtrack.backend.controller;

import lombok.Data;

@Data
public class ChatDTO {
    private Integer senderId;
    private Integer receiverId;
    private String message;
    private String timestamp; // ISO 8601 format (e.g., "2025-04-26T10:00:00Z")
}