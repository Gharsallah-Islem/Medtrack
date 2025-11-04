package com.medtrack.backend.repository;

import com.medtrack.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Integer> {
    List<Report> findByPatientId(Integer patientId);
    List<Report> findByDoctorId(Integer doctorId);
    Optional<Report> findByPdfPath(String pdfPath);
}