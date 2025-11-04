package com.medtrack.backend.controller;

import com.medtrack.backend.entity.Chat;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.service.ChatService;
import com.medtrack.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final UserService userService;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ChatController.class);

    @Autowired
    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Chat> sendMessage(@RequestBody ChatDTO chatDTO) {
        try {
            User sender = userService.findById(chatDTO.getSenderId())
                    .orElseThrow(() -> new IllegalArgumentException("Sender not found with ID: " + chatDTO.getSenderId()));
            User receiver = userService.findById(chatDTO.getReceiverId())
                    .orElseThrow(() -> new IllegalArgumentException("Receiver not found with ID: " + chatDTO.getReceiverId()));

            Chat chat = new Chat();
            chat.setSender(sender);
            chat.setReceiver(receiver);
            chat.setMessage(chatDTO.getMessage());
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(chatDTO.getTimestamp());
            chat.setTimestamp(offsetDateTime.toLocalDateTime());
            // 'read' is set to false by default in Chat entity

            Chat savedChat = chatService.sendMessage(chat);
            return ResponseEntity.ok(savedChat);
        } catch (Exception e) {
            logger.error("Error sending message: ", e);
            return ResponseEntity.badRequest().body(null); // Return 400 with null body for now
        }
    }

    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<List<Chat>> getConversation(@PathVariable Integer userId1, @PathVariable Integer userId2) {
        logger.info("Fetching conversation between user ID: {} and user ID: {}", userId1, userId2);
        List<Chat> messages = chatService.getConversation(userId1, userId2);
        logger.debug("Returning {} messages: {}", messages.size(), messages);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread/{receiverId}")
    public ResponseEntity<List<Chat>> getUnreadMessages(@PathVariable Integer receiverId) {
        List<Chat> unreadMessages = chatService.getUnreadMessages(receiverId);
        return ResponseEntity.ok(unreadMessages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Chat> markAsRead(@PathVariable Integer messageId) {
        Chat updatedChat = chatService.markAsRead(messageId);
        return ResponseEntity.ok(updatedChat);
    }
}