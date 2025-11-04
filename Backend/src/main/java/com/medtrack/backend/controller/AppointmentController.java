package com.medtrack.backend.controller;

import com.medtrack.backend.entity.Appointment;
import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.UserRepository;
import com.medtrack.backend.repository.AppointmentSlotRepository;
import com.medtrack.backend.repository.AvailabilityRepository;
import com.medtrack.backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.medtrack.backend.service.UserService;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AppointmentController.class);

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final UserService userService;


    @Autowired
    public AppointmentController(AppointmentService appointmentService, UserRepository userRepository, AvailabilityRepository availabilityRepository, AppointmentSlotRepository appointmentSlotRepository, UserService userService) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@Validated @RequestBody AppointmentDTO appointmentDTO) {
        try {
            logger.info("Creating appointment with DTO: {}", appointmentDTO);

            // Validate patient
            User patient = userRepository.findById(appointmentDTO.getPatientId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + appointmentDTO.getPatientId()));
            if (patient.getRole() != User.Role.patient) {
                throw new IllegalArgumentException("User with ID " + appointmentDTO.getPatientId() + " is not a patient");
            }

            // Validate doctor
            User doctor = userRepository.findById(appointmentDTO.getDoctorId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + appointmentDTO.getDoctorId()));
            if (doctor.getRole() != User.Role.doctor) {
                throw new IllegalArgumentException("User with ID " + appointmentDTO.getDoctorId() + " is not a doctor");
            }

            // Validate slot
            AppointmentSlot slot = appointmentSlotRepository.findById(appointmentDTO.getSlotId())
                    .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + appointmentDTO.getSlotId()));
            if (slot.isBooked()) {
                throw new IllegalArgumentException("Slot is not available for ID: " + appointmentDTO.getSlotId());
            }
            if (slot.getSlotStartTime() == null) {
                throw new IllegalArgumentException("Slot start time is missing for slot ID: " + appointmentDTO.getSlotId());
            }

            // Create appointment
            Appointment appointment = new Appointment();
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setSlot(slot);
            appointment.setStatus(Appointment.Status.approved);
            appointment.setCreatedAt(LocalDateTime.now());

            Appointment savedAppointment = appointmentService.createAppointment(appointment);
            logger.info("Appointment created successfully: {}", savedAppointment);
            return ResponseEntity.ok(savedAppointment);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Internal server error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Appointment> approveAppointment(@PathVariable Integer id) {
        logger.info("Approving appointment ID: {}", id);
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(@PathVariable Integer patientId) {
        logger.info("Fetching appointments for patient ID: {}", patientId);
        List<Appointment> appointments = appointmentService.getAppointmentsByPatient(patientId);
        logger.info("Returning {} appointments for patient ID: {}", appointments.size(), patientId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable Integer doctorId) {
        logger.info("Fetching appointments for doctor ID: {}", doctorId);
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
        logger.info("Returning {} appointments for doctor ID: {}", appointments.size(), doctorId);
        return ResponseEntity.ok(appointments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Integer id) {
        logger.info("Canceling appointment ID: {}", id);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        Appointment appointment = appointmentService.getAppointmentById(id);
        User patient = appointment.getPatient();
        User doctor = appointment.getDoctor();
        if (!patient.getUsername().equals(currentUsername) && !doctor.getUsername().equals(currentUsername)) {
            logger.warn("Unauthorized attempt to cancel appointment ID: {} by user: {}", id, currentUsername);
            return ResponseEntity.status(403).build();
        }
        appointmentService.deleteAppointment(id);
        logger.info("Appointment ID: {} canceled successfully", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available-doctors")
    public ResponseEntity<List<User>> getAvailableDoctors(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String location) {
        logger.info("Fetching available doctors with filters - name: {}, specialty: {}, location: {}", name, specialty, location);
        List<User> doctors = userService.getFilteredDoctors(name != null ? name : "", specialty != null ? specialty : "", location != null ? location : "");
        logger.info("Returning {} doctors", doctors.size());
        return ResponseEntity.ok(doctors);
    }
}