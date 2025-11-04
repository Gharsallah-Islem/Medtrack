package com.medtrack.backend.repository;

import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Integer> {
    @Query("SELECT s FROM AppointmentSlot s WHERE s.id = ?1")
    Optional<AppointmentSlot> findSlotById(Integer slotId);

    @Query("SELECT s FROM AppointmentSlot s WHERE s.availability.doctor.id = ?1 AND s.slotStartTime = ?2 AND s.isBooked = false")
    Optional<AppointmentSlot> findAvailableSlotByDoctorIdAndDateTime(Integer doctorId, LocalDateTime dateTime);

    @Query("SELECT s FROM AppointmentSlot s WHERE s.patient.id = ?1 AND s.isBooked = true")
    List<AppointmentSlot> findSlotsByPatientId(Integer patientId);

    @Query("SELECT s FROM AppointmentSlot s WHERE s.availability.doctor.id = ?1 AND s.isBooked = true")
    List<AppointmentSlot> findSlotsByDoctorId(Integer doctorId);

    @Query("UPDATE AppointmentSlot s SET s.isBooked = ?2, s.patient = ?3 WHERE s.id = ?1")
    @Modifying
    void updateSlot(Integer slotId, boolean isBooked, User patient);

    @Query("UPDATE AppointmentSlot s SET s.isBooked = ?2, s.patient = ?3, s.status = ?4, s.createdAt = ?5 WHERE s.id = ?1")
    @Modifying
    void updateSlot(Integer slotId, boolean isBooked, User patient, AppointmentSlot.Status status, LocalDateTime createdAt);
    @Query("SELECT s FROM AppointmentSlot s WHERE s.slotEndTime < ?1")
    List<AppointmentSlot> findBySlotEndTimeBefore(LocalDateTime endTime);
}