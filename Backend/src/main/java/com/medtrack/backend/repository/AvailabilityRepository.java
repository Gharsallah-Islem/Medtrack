package com.medtrack.backend.repository;

import com.medtrack.backend.entity.Availability;
import com.medtrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository extends JpaRepository<Availability, Integer> {
    Optional<Availability> findByDoctorAndDate(User doctor, LocalDate date);
    boolean existsByDoctorAndDate(User doctor, LocalDate date);
    List<Availability> findByDoctor(User doctor);

    @Query("DELETE FROM Availability a WHERE a.date < ?1")
    @Modifying
    void deleteByDateBefore(LocalDate date);
}