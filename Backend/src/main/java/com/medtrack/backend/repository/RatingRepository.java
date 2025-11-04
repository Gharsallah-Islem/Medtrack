package com.medtrack.backend.repository;

import com.medtrack.backend.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Integer> {
    List<Rating> findByDoctorId(Integer doctorId);
    List<Rating> findByPatientId(Integer patientId);

}