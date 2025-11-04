package com.medtrack.backend.controller;

import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.Availability;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.service.AvailabilityService;
import com.medtrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {
    private final AvailabilityService availabilityService;
    private final UserRepository userRepository;

    @Autowired
    public AvailabilityController(AvailabilityService availabilityService, UserRepository userRepository) {
        this.availabilityService = availabilityService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> addAvailability(@RequestBody Availability availability) {
        try {
            return ResponseEntity.ok(availabilityService.addAvailability(availability));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> addAvailabilities(@RequestBody List<Availability> availabilities) {
        try {
            return ResponseEntity.ok(availabilityService.addAvailabilities(availabilities));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/doctor")
    public ResponseEntity<?> getAvailabilityByDoctor() {
        try {
            String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User doctor = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Authenticated doctor not found: " + username));
            return ResponseEntity.ok(availabilityService.getAvailabilityByDoctor(doctor.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/doctor/{doctorId}/slots")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Integer doctorId, @RequestParam String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<AppointmentSlot> slots = availabilityService.getAvailableSlotsByDoctor(doctorId, localDate);
            return ResponseEntity.ok(slots);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/book/{slotId}")
    public ResponseEntity<?> bookSlot(@PathVariable Integer slotId) {
        try {
            String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User patient = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Authenticated patient not found: " + username));
            AppointmentSlot bookedSlot = availabilityService.bookSlot(slotId, patient.getId());
            return ResponseEntity.ok(bookedSlot);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAvailability(@PathVariable Integer id, @RequestBody Availability availability) {
        if (!id.equals(availability.getId())) {
            return ResponseEntity.badRequest().body("ID mismatch");
        }
        try {
            Availability updated = availabilityService.updateAvailability(availability);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Integer id) {
        try {
            availabilityService.deleteAvailability(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}