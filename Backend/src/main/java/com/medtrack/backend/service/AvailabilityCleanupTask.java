package com.medtrack.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AvailabilityCleanupTask {
    private final AvailabilityService availabilityService;

    @Autowired
    public AvailabilityCleanupTask(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @Scheduled(cron = "0 0 0 * * ?") // Run daily at midnight
    public void cleanupExpiredAvailabilities() {
        availabilityService.deleteExpiredAvailabilities();
    }
}