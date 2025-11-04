package com.medtrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Medications")
@Data
public class Medication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(nullable = false)
    private String name;

    private String dosage;

    @Column(nullable = false)
    private String frequency;

    @Column(nullable = false ,columnDefinition = "TEXT")
    private String schedules;

    private LocalDateTime createdAt = LocalDateTime.now();
}