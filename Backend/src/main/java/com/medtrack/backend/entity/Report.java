package com.medtrack.backend.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reports")
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @Column(nullable = false)
    private String filePath;

    private String enhancedFilePath;
    private String pdfPath;

    @Enumerated(EnumType.STRING)
    private SentStatus sentStatus = SentStatus.pending;

    private LocalDateTime sentAt;
}