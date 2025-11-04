package com.medtrack.backend.repository;

import com.medtrack.backend.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Integer> {
    List<Medication> findByPatientId(Integer patientId);
}