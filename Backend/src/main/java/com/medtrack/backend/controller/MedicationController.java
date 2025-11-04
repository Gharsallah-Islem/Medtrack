package com.medtrack.backend.controller;

import com.medtrack.backend.entity.Medication;
import com.medtrack.backend.service.MedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {
    private final MedicationService medicationService;

    @Autowired
    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Medication>> getMedicationsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(medicationService.getMedicationsByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<?> addMedication(@RequestBody Medication medication) {
        try {
            return ResponseEntity.ok(medicationService.addMedication(medication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedication(@PathVariable Integer id, @RequestBody Medication medication) {
        try {
            return ResponseEntity.ok(medicationService.updateMedication(id, medication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable Integer id) {
        medicationService.deleteMedication(id);
        return ResponseEntity.noContent().build();
    }
}