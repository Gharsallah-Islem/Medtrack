package com.medtrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String firstName; // Added for doctor names
    private String lastName;  // Added for doctor names

    private String specialty; // For doctors
    private String location;

    private String verificationCode;
    private boolean isActive = false;
    
    private boolean isProfileComplete = false;

    @Column(nullable = false, updatable = false,name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        patient, doctor, admin
    }
}