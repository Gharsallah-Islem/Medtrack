package com.medtrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "appointment_slots")
@Data
public class AppointmentSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "availability_id", nullable = false)
    @JsonIgnore
    private Availability availability;

    @Column(name = "slot_start_time", nullable = false)
    private LocalDateTime slotStartTime;

    @Column(name = "slot_end_time", nullable = false)
    private LocalDateTime slotEndTime;

    @Column(name = "is_booked")
    private boolean isBooked = false;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @Enumerated(EnumType.STRING)
    private Status status = Status.pending;

    private LocalDateTime createdAt;

    @Version
    private Long version;

    public enum Status {
        pending, approved, completed
    }
}