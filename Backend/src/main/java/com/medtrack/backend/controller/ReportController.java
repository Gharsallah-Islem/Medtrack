package com.medtrack.backend.controller;

import com.medtrack.backend.entity.Report;
import com.medtrack.backend.repository.ReportRepository;
import com.medtrack.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;
    private final ReportRepository reportRepository;
    private final String uploadDir = "uploads/reports/";
    @Autowired
    public ReportController(ReportService reportService, ReportRepository reportRepository) {
        this.reportService = reportService;
        this.reportRepository = reportRepository;
    }

   @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("pdfFile") MultipartFile pdfFile,
            @RequestParam("patientId") Integer patientId,
            @RequestParam("doctorId") Integer doctorId) {
        try {
            Report report = reportService.uploadReport(file, pdfFile, patientId, doctorId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Report uploaded successfully.");
            response.put("reportId", report.getId().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error uploading report: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Report>> getReportsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(reportService.getReportsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Report>> getReportsByDoctor(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(reportService.getReportsByDoctor(doctorId));
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(uploadDir + filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Determine content type (PDF or image)
        String contentType = filename.endsWith(".pdf") ? MediaType.APPLICATION_PDF_VALUE : MediaType.IMAGE_JPEG_VALUE;

        // For viewing, use inline disposition; for downloading, use attachment (handled by frontend)
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
    @GetMapping("/download/{reportId}")
    public ResponseEntity<Resource> downloadReport(@PathVariable Integer reportId) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));
            File file = new File(report.getPdfPath()); // Use pdfPath for download
            if (!file.exists()) {
                throw new RuntimeException("File not found");
            }

            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}