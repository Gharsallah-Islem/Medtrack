package com.medtrack.backend.service;

import com.medtrack.backend.entity.Rating;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {
    private final RatingRepository ratingRepository;
    private final UserService userService;

    @Autowired
    public RatingService(RatingRepository ratingRepository, UserService userService) {
        this.ratingRepository = ratingRepository;
        this.userService = userService;
    }

    @Transactional
    public Rating addRating(Rating rating) {
        // Validate patient and doctor
        Optional<User> patient = userService.findById(rating.getPatient().getId());
        if (patient.isEmpty()) {
            throw new IllegalArgumentException("Patient with ID " + rating.getPatient().getId() + " does not exist");
        }
        Optional<User> doctor = userService.findById(rating.getDoctor().getId());
        if (doctor.isEmpty()) {
            throw new IllegalArgumentException("Doctor with ID " + rating.getDoctor().getId() + " does not exist");
        }

        // Ensure patient and doctor roles
        if (patient.get().getRole() != User.Role.patient) {
            throw new IllegalArgumentException("User ID " + rating.getPatient().getId() + " is not a patient");
        }
        if (doctor.get().getRole() != User.Role.doctor) {
            throw new IllegalArgumentException("User ID " + rating.getDoctor().getId() + " is not a doctor");
        }

        rating.setPatient(patient.get());
        rating.setDoctor(doctor.get());
        Rating savedRating = ratingRepository.save(rating);
        System.out.println("Saved rating: " + savedRating);
        return savedRating;
    }

    public List<Rating> getRatingsByDoctor(Integer doctorId) {
        return ratingRepository.findByDoctorId(doctorId);
    }

    public List<Rating> getRatingsByPatient(Integer patientId) {
        return ratingRepository.findByPatientId(patientId);
    }
}