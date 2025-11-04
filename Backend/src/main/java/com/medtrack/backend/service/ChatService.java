package com.medtrack.backend.service;

import com.medtrack.backend.entity.Chat;
import com.medtrack.backend.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    public Chat sendMessage(Chat chat) {
        chat.setRead(false); // Default to unread for new messages
        return chatRepository.save(chat);
    }

    public List<Chat> getConversation(Integer userId1, Integer userId2) {
        return chatRepository.findConversationBetween(userId1, userId2);
    }

    public List<Chat> getUnreadMessages(Integer receiverId) {
        return chatRepository.findByReceiverIdAndReadFalse(receiverId);
    }

    public Chat markAsRead(Integer messageId) {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        chat.setRead(true);
        return chatRepository.save(chat);
    }
}