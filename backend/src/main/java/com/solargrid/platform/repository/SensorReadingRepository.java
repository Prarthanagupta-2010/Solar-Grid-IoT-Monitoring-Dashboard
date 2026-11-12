package com.solargrid.platform.repository;

import com.solargrid.platform.entity.SensorReading;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    void deleteByDeviceId(Long deviceId);
    List<SensorReading> findByDeviceIdOrderByCreatedAtDesc(Long deviceId, Pageable pageable);
    Optional<SensorReading> findTopByDeviceIdOrderByCreatedAtDesc(Long deviceId);
    List<SensorReading> findTop100ByOrderByCreatedAtDesc();
    long countByAnomalousTrueAndCreatedAtAfter(Instant after);

    @Query("select coalesce(sum(r.energyOutput), 0) from SensorReading r where r.createdAt >= :after")
    double sumEnergyOutputAfter(@Param("after") Instant after);

    @Query("select r from SensorReading r where r.createdAt >= :after order by r.createdAt asc")
    List<SensorReading> findAllAfter(@Param("after") Instant after);
}
