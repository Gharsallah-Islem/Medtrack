package com.medtrack.backend.repository;

import com.medtrack.backend.entity.Statistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface StatisticsRepository extends JpaRepository<Statistics, Integer> {
    List<Statistics> findByPatientId(Integer patientId);

    List<Statistics> findByDataType(String dataType);

    //  @Query(value = "SELECT s.* FROM statistics s " +
    //     "JOIN statistics_metadata m ON s.id = m.statistics_id " +
    //     "WHERE m.meta_key = ?1 AND m.meta_value = ?2",
    //     nativeQuery = true)
    // List<Statistics> findByMetadata(String key, String value);

    List<Statistics> findByDataTypeAndDateBetween(String dataType, LocalDate startDate, LocalDate endDate);
}