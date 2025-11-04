package com.medtrack.backend.service;

import com.medtrack.backend.entity.Appointment;
import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.AppointmentRepository;
import com.medtrack.backend.repository.AppointmentSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository, AppointmentSlotRepository appointmentSlotRepository) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
    }

    @Transactional
    public Appointment createAppointment(Appointment appointment) {
        // Validate slot
        AppointmentSlot slot = appointment.getSlot();
        if (slot == null || slot.isBooked()) {
            throw new IllegalStateException("Slot is not available: " + (slot != null ? slot.getId() : "null"));
        }
        if (slot.getSlotStartTime() == null) {
            throw new IllegalStateException("Slot start time is missing for slot ID: " + slot.getId());
        }

        // Mark slot as booked
        slot.setBooked(true);
        slot.setPatient(appointment.getPatient());
        slot.setStatus(AppointmentSlot.Status.approved); // Align with auto-approval
        slot.setCreatedAt(LocalDateTime.now());
        appointmentSlotRepository.updateSlot(slot.getId(), true, appointment.getPatient(), AppointmentSlot.Status.approved, slot.getCreatedAt());

        // Save appointment
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment approveAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Appointment.Status.approved);
        AppointmentSlot slot = appointment.getSlot();
        if (slot != null) {
            slot.setStatus(AppointmentSlot.Status.approved);
            appointmentSlotRepository.updateSlot(slot.getId(), slot.isBooked(), slot.getPatient(), AppointmentSlot.Status.approved, slot.getCreatedAt());
        }
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByPatient(Integer patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(Integer doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    @Transactional
    public void deleteAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (appointment.getStatus() != Appointment.Status.pending && appointment.getStatus() != Appointment.Status.approved) {
            throw new IllegalStateException("Only pending or approved appointments can be canceled");
        }

        // Re-mark slot as available
        AppointmentSlot slot = appointment.getSlot();
        if (slot != null) {
            slot.setBooked(false);
            slot.setPatient(null);
            slot.setStatus(null);
            slot.setCreatedAt(null);
            appointmentSlotRepository.updateSlot(slot.getId(), false, null, null, null);
        }

        appointmentRepository.deleteById(id);
    }

    public Appointment getAppointmentById(Integer id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}