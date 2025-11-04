package com.medtrack.backend.controller;

import com.medtrack.backend.entity.Statistics;
import com.medtrack.backend.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Statistics>> getStatisticsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(statisticsService.getStatisticsByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<Statistics> addStatistics(@RequestBody Statistics statistics) {
        return ResponseEntity.ok(statisticsService.addStatistics(statistics));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAuthority('doctor') and #doctorId == authentication.principal.id")
    public ResponseEntity<Map<String, Object>> getDoctorStatistics(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(statisticsService.getDoctorStatistics(doctorId));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getAdminStatistics(startDate, endDate));
    }
}