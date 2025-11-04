package com.medtrack.backend.service;

import com.medtrack.backend.entity.Report;
import com.medtrack.backend.entity.SentStatus;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {
    private final ReportRepository reportRepository;
    private final String uploadDir = "uploads/reports/"; // Adjust path as needed

    @Autowired
    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
        // Create upload directory if it doesn't exist
        new File(uploadDir).mkdirs();
    }

    public Report uploadReport(MultipartFile file, MultipartFile pdfFile, Integer patientId, Integer doctorId) throws IOException {
        // Generate unique filenames
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String pdfFileName = pdfFile != null ? UUID.randomUUID() + "_report.pdf" : null;

        // Save files
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());

      
        if (pdfFile != null) {
            Files.write(Paths.get(uploadDir + pdfFileName), pdfFile.getBytes());
        }

        // Create report entity
        Report report = new Report();
        report.setPatient(new User() {{ setId(patientId); }});
        report.setDoctor(new User() {{ setId(doctorId); }});
        report.setFilePath(filePath.toString());
        report.setPdfPath(pdfFileName != null ? uploadDir + pdfFileName : null);
        report.setSentAt(LocalDateTime.now());
        report.setSentStatus(SentStatus.sent);

        return reportRepository.save(report);
    }

    public List<Report> getReportsByPatient(Integer patientId) {
        return reportRepository.findByPatientId(patientId);
    }

    public List<Report> getReportsByDoctor(Integer doctorId) {
        return reportRepository.findByDoctorId(doctorId);
    }
    public Report findByPdfPath(String pdfPath) {
        return reportRepository.findByPdfPath(pdfPath).orElse(null);
    }

    public Report findById(Integer id) {
        return reportRepository.findById(id).orElse(null);
    }
}