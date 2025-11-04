package com.medtrack.backend.service;

import com.medtrack.backend.entity.Availability;
import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.AppointmentSlotRepository;
import com.medtrack.backend.repository.AvailabilityRepository;
import com.medtrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilityService {
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final UserRepository userRepository;

    @Autowired
    public AvailabilityService(AvailabilityRepository availabilityRepository, AppointmentSlotRepository appointmentSlotRepository, UserRepository userRepository) {
        this.availabilityRepository = availabilityRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Availability addAvailability(Availability availability) {
        setDoctorFromAuthentication(availability);
        validateAvailability(availability);
        generateAppointmentSlots(availability);
        return availabilityRepository.save(availability);
    }

    @Transactional
    public List<Availability> addAvailabilities(List<Availability> availabilities) {
        List<Availability> savedAvailabilities = new ArrayList<>();
        for (Availability avail : availabilities) {
            setDoctorFromAuthentication(avail);
            validateAvailability(avail);
            if (availabilityRepository.existsByDoctorAndDate(avail.getDoctor(), avail.getDate())) {
                throw new IllegalArgumentException("Availability already exists for doctor on " + avail.getDate());
            }
            generateAppointmentSlots(avail);
            savedAvailabilities.add(avail);
        }
        return availabilityRepository.saveAll(savedAvailabilities);
    }

    public List<Availability> getAvailabilityByDoctor(Integer doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));
        return availabilityRepository.findByDoctor(doctor);
    }

    public List<AppointmentSlot> getAvailableSlotsByDoctor(Integer doctorId, LocalDate date) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));
        Availability availability = availabilityRepository.findByDoctorAndDate(doctor, date)
                .orElseThrow(() -> new IllegalArgumentException("No availability found for " + date));
        LocalDateTime now = LocalDateTime.now(); // Current time: 01:27 AM CET, May 16, 2025
        return availability.getAppointmentSlots().stream()
                .filter(slot -> !slot.isBooked() && (date.isAfter(now.toLocalDate()) ||
                        (date.isEqual(now.toLocalDate()) && slot.getSlotStartTime().toLocalTime().isAfter(now.toLocalTime()))))
                .toList();
    }

    @Transactional
    public AppointmentSlot bookSlot(Integer slotId, Integer patientId) {
        AppointmentSlot slot = appointmentSlotRepository.findSlotById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found: " + slotId));
        if (slot.isBooked()) {
            throw new IllegalArgumentException("Slot is already booked");
        }
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
        slot.setBooked(true);
        slot.setPatient(patient);
        slot.setStatus(AppointmentSlot.Status.pending);
        slot.setCreatedAt(LocalDateTime.now());
        appointmentSlotRepository.updateSlot(slot.getId(), true, patient, AppointmentSlot.Status.pending, slot.getCreatedAt());
        return slot;
    }

    @Transactional
    public Availability updateAvailability(Availability availability) {
        if (!availabilityRepository.existsById(availability.getId())) {
            throw new IllegalArgumentException("Availability not found: " + availability.getId());
        }
        Availability existing = availabilityRepository.findById(availability.getId())
                .orElseThrow(() -> new IllegalArgumentException("Availability not found: " + availability.getId()));
        existing.setDate(availability.getDate());
        existing.setStartTime(availability.getStartTime());
        existing.setEndTime(availability.getEndTime());
        existing.setVersion(availability.getVersion());
        setDoctorFromAuthentication(existing);
        validateAvailability(existing);
        existing.getAppointmentSlots().clear();
        generateAppointmentSlots(existing);
        return availabilityRepository.save(existing);
    }

    @Transactional
    public void deleteAvailability(Integer id) {
        availabilityRepository.deleteById(id);
    }

    @Transactional
    public void deleteExpiredAvailabilities() {
        LocalDate today = LocalDate.now();
        availabilityRepository.deleteByDateBefore(today);
    }

    private void validateAvailability(Availability availability) {
        if (availability.getDoctor() == null) {
            throw new IllegalArgumentException("Doctor cannot be null");
        }
        if (availability.getDate() == null || availability.getStartTime() == null || availability.getEndTime() == null) {
            throw new IllegalArgumentException("Date, start time, and end time cannot be null");
        }
        if (availability.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Availability date cannot be in the past");
        }
        if (availability.getStartTime().isAfter(availability.getEndTime()) ||
                availability.getStartTime().equals(availability.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        long minutes = ChronoUnit.MINUTES.between(availability.getStartTime(), availability.getEndTime());
        if (minutes < 45) {
            throw new IllegalArgumentException("Interval must be at least 45 minutes");
        }
    }

    private void generateAppointmentSlots(Availability availability) {
        List<AppointmentSlot> slots = new ArrayList<>();
        LocalDateTime slotStart = LocalDateTime.of(availability.getDate(), availability.getStartTime());
        LocalDateTime intervalEnd = LocalDateTime.of(availability.getDate(), availability.getEndTime());

        while (slotStart.plusMinutes(40).isBefore(intervalEnd) || slotStart.plusMinutes(40).isEqual(intervalEnd)) {
            AppointmentSlot slot = new AppointmentSlot();
            slot.setAvailability(availability);
            slot.setSlotStartTime(slotStart);
            slot.setSlotEndTime(slotStart.plusMinutes(40));
            slot.setBooked(false);
            slots.add(slot);
            slotStart = slotStart.plusMinutes(45);
        }

        availability.setAppointmentSlots(slots);
    }

    private void setDoctorFromAuthentication(Availability availability) {
        String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated doctor not found: " + username));
        if (!doctor.getRole().equals(User.Role.doctor)) {
            throw new IllegalArgumentException("Authenticated user is not a doctor");
        }
        availability.setDoctor(doctor);
    }
}