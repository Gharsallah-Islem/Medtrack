package com.medtrack.backend.service;

import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.Availability;
import com.medtrack.backend.repository.AppointmentSlotRepository;
import com.medtrack.backend.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CleanupService {

    @Autowired
    private AppointmentSlotRepository appointmentSlotRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deletePastSlotsAndAvailabilities() {
        LocalDateTime now = LocalDateTime.now();

        // Find and delete all slots where slotEndTime is in the past
        List<AppointmentSlot> pastSlots = appointmentSlotRepository.findBySlotEndTimeBefore(now);
        appointmentSlotRepository.deleteAll(pastSlots);

        // Find and delete availabilities that have no associated slots
        List<Availability> emptyAvailabilities = availabilityRepository.findAll().stream()
                .filter(availability -> availability.getAppointmentSlots().isEmpty())
                .toList();
        availabilityRepository.deleteAll(emptyAvailabilities);
    }
}