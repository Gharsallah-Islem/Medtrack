package com.medtrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "Statistics")
@Data
public class Statistics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;

    @Column(nullable = false)
    private String dataType;

    @Column(nullable = false)
    private String value;

    @Column(nullable = false)
    private LocalDate date;

    @ElementCollection
    @MapKeyColumn(name = "meta_key")
    @Column(name = "meta_value")
    @CollectionTable(name = "statistics_metadata", joinColumns = @JoinColumn(name = "statistics_id"))
    private Map<String, String> metadata;
}