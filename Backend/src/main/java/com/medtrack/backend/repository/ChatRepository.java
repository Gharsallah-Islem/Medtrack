package com.medtrack.backend.repository;

import com.medtrack.backend.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findBySenderIdAndReceiverId(Integer senderId, Integer receiverId);
    @Query("SELECT c FROM Chat c WHERE (c.sender.id = :userId1 AND c.receiver.id = :userId2) OR (c.sender.id = :userId2 AND c.receiver.id = :userId1) ORDER BY c.timestamp ASC")
    List<Chat> findConversationBetween(Integer userId1, Integer userId2);
    List<Chat> findByReceiverIdAndReadFalse(Integer receiverId); // Added to fetch unread messages
}