package com.medtrack.backend.service;

import com.medtrack.backend.entity.Appointment;
import com.medtrack.backend.entity.AppointmentSlot;
import com.medtrack.backend.entity.Rating;
import com.medtrack.backend.entity.Statistics;
import com.medtrack.backend.entity.User;
import com.medtrack.backend.repository.AppointmentRepository;
import com.medtrack.backend.repository.AppointmentSlotRepository;
import com.medtrack.backend.repository.StatisticsRepository;
import com.medtrack.backend.repository.RatingRepository;
import com.medtrack.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticsService {
    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);

    private final StatisticsRepository statisticsRepository;
    private final AppointmentRepository appointmentRepository;
    private final RatingRepository ratingRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final UserRepository userRepository;

    @Autowired
    public StatisticsService(StatisticsRepository statisticsRepository, AppointmentRepository appointmentRepository,
                             RatingRepository ratingRepository, AppointmentSlotRepository appointmentSlotRepository,
                             UserRepository userRepository) {
        this.statisticsRepository = statisticsRepository;
        this.appointmentRepository = appointmentRepository;
        this.ratingRepository = ratingRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.userRepository = userRepository;
    }

    public List<Statistics> getStatisticsByPatient(Integer patientId) {
        logger.info("Fetching statistics for patientId: {}", patientId);
        List<Statistics> stats = statisticsRepository.findByPatientId(patientId);
        logger.debug("Found {} statistics for patientId: {}", stats.size(), patientId);
        return stats;
    }

    public Statistics addStatistics(Statistics statistics) {
        logger.info("Adding statistics: {}", statistics);
        Statistics saved = statisticsRepository.save(statistics);
        logger.debug("Saved statistics: {}", saved);
        return saved;
    }

    public Map<String, Object> getDoctorStatistics(Integer doctorId) {
        logger.info("Fetching doctor statistics for doctorId: {}", doctorId);

        List<AppointmentSlot> appointments = appointmentSlotRepository.findSlotsByDoctorId(doctorId);
        logger.debug("Found {} appointment slots for doctorId: {}", appointments.size(), doctorId);

        List<Rating> ratings = ratingRepository.findByDoctorId(doctorId);
        logger.debug("Found {} ratings for doctorId: {}", ratings.size(), doctorId);

        Map<String, Object> stats = new HashMap<>();

        // Aggregate appointments by month
        Map<String, Long> monthlyAppointments = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> YearMonth.from(a.getSlotStartTime()).toString(),
                        HashMap::new,
                        Collectors.counting()
                ));
        stats.put("monthlyAppointments", monthlyAppointments);

        // Aggregate ratings by month
        Map<String, Double> monthlyRatings = ratings.stream()
                .collect(Collectors.groupingBy(
                        r -> YearMonth.from(r.getCreatedAt()).toString(),
                        HashMap::new,
                        Collectors.averagingDouble(Rating::getRating)
                ));
        stats.put("monthlyRatings", monthlyRatings);

        logger.info("Returning statistics for doctorId: {} with {} keys", doctorId, stats.size());
        return stats;
    }

    public List<Statistics> getSystemStatistics() {
        logger.info("Fetching system-wide statistics");
        return statisticsRepository.findAll();
    }

   public Map<String, Object> getAdminStatistics(LocalDate startDate, LocalDate endDate) {
    logger.info("Fetching admin statistics from {} to {}", startDate, endDate);
    Map<String, Object> stats = new HashMap<>();

    // User Activity Trends
    List<User> users = userRepository.findAll();
    Map<String, Long> userRegistrations = users.stream()
            .filter(u -> {
                LocalDate createdDate = u.getCreatedAt().toLocalDate();
                return !createdDate.isBefore(startDate) && !createdDate.isAfter(endDate);
            })
            .collect(Collectors.groupingBy(
                    u -> u.getCreatedAt().toLocalDate().toString(),
                    HashMap::new,
                    Collectors.counting()
            ));
    stats.put("userRegistrations", userRegistrations);

    // Appointment Distribution by Status
    List<AppointmentSlot> appointments = appointmentSlotRepository.findAll().stream()
            .filter(a -> {
                LocalDate slotDate = a.getSlotStartTime().toLocalDate();
                return !slotDate.isBefore(startDate) && !slotDate.isAfter(endDate);
            })
            .collect(Collectors.toList());
    Map<String, Long> appointmentStatusDistribution = appointments.stream()
            .collect(Collectors.groupingBy(
                    a -> a.getStatus().toString(),
                    HashMap::new,
                    Collectors.counting()
            ));
    stats.put("appointmentStatusDistribution", appointmentStatusDistribution);

    // Appointment Distribution by Doctor
    Map<String, Long> appointmentsByDoctor = appointments.stream()
            .filter(a -> a.getDoctor() != null)
            .collect(Collectors.groupingBy(
                    a -> a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName(),
                    HashMap::new,
                    Collectors.counting()
            ));
    stats.put("appointmentsByDoctor", appointmentsByDoctor);

    // Patient Health Metrics
    List<Statistics> healthStats = statisticsRepository.findByDataTypeAndDateBetween("blood_pressure", startDate, endDate);
    Map<String, Double> avgBloodPressureByDate = healthStats.stream()
            .collect(Collectors.groupingBy(
                    s -> s.getDate().toString(),
                    HashMap::new,
                    Collectors.averagingDouble(s -> {
                        try {
                            return Double.parseDouble(s.getValue());
                        } catch (NumberFormatException e) {
                            return 0.0;
                        }
                    })
            ));
    stats.put("avgBloodPressureByDate", avgBloodPressureByDate);

    // Engagement Score
    Map<Integer, Double> engagementScores = new HashMap<>();
    List<User> patients = userRepository.findByRole(User.Role.patient);
    for (User patient : patients) {
        long appointmentCount = appointmentSlotRepository.findSlotsByPatientId(patient.getId()).size();
        long feedbackCount = ratingRepository.findByPatientId(patient.getId()).size();
        double score = (appointmentCount * 0.6) + (feedbackCount * 0.4);
        engagementScores.put(patient.getId(), score);
    }
    stats.put("engagementScores", engagementScores);

    // Peak Usage Times
    Map<String, Long> appointmentsByHour = appointments.stream()
            .collect(Collectors.groupingBy(
                    a -> String.valueOf(a.getSlotStartTime().getHour()),
                    HashMap::new,
                    Collectors.counting()
            ));
    stats.put("appointmentsByHour", appointmentsByHour);

    logger.info("Returning admin statistics with {} keys", stats.size());
    return stats;
}
}