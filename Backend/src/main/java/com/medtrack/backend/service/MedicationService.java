package com.medtrack.backend.service;

import com.medtrack.backend.entity.Medication;
import com.medtrack.backend.repository.MedicationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
public class MedicationService {
    private final MedicationRepository medicationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public MedicationService(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    public List<Medication> getMedicationsByPatient(Integer patientId) {
        return medicationRepository.findByPatientId(patientId);
    }

    public Medication addMedication(Medication medication) {
        validateMedication(medication);
        return medicationRepository.save(medication);
    }

    public Medication updateMedication(Integer id, Medication medication) {
        Medication existing = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));
        existing.setName(medication.getName());
        existing.setDosage(medication.getDosage());
        existing.setFrequency(medication.getFrequency());
        existing.setSchedules(medication.getSchedules());
        validateMedication(existing);
        return medicationRepository.save(existing);
    }

    public void deleteMedication(Integer id) {
        medicationRepository.deleteById(id);
    }

    private void validateMedication(Medication medication) {
        if (medication.getSchedules() == null || medication.getSchedules().isEmpty()) {
            throw new IllegalArgumentException("Schedules are required.");
        }
        try {
            Map<String, String> schedules = objectMapper.readValue(medication.getSchedules(), Map.class);
            String startDateStr = schedules.get("startDate");
            String endDateStr = schedules.get("endDate");
            String dailyTimesStr = schedules.get("dailyTimes");

            if (startDateStr == null || endDateStr == null || dailyTimesStr == null) {
                throw new IllegalArgumentException("Schedules must include startDate, endDate, and dailyTimes.");
            }

            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);
            String[] dailyTimes = dailyTimesStr.split(",");

            LocalDate today = LocalDate.now();
            LocalDate maxDate = today.plusDays(30);

            if (startDate.isBefore(today)) {
                throw new IllegalArgumentException("Start date cannot be in the past.");
            }
            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("End date must be after start date.");
            }
            if (startDate.isAfter(maxDate) || endDate.isAfter(maxDate)) {
                throw new IllegalArgumentException("Dates cannot be more than 30 days in the future.");
            }

            for (String time : dailyTimes) {
                LocalTime.parse(time.trim());
            }

            int expectedTimes = switch (medication.getFrequency()) {
                case "1 time daily" -> 1;
                case "2 times daily" -> 2;
                case "3 times daily" -> 3;
                default -> throw new IllegalArgumentException("Invalid frequency: " + medication.getFrequency());
            };

            if (dailyTimes.length != expectedTimes) {
                throw new IllegalArgumentException(medication.getFrequency() + " requires exactly " + expectedTimes + " daily times.");
            }
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date or time format: " + e.getMessage());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid schedules JSON: " + e.getMessage());
        }
    }
}