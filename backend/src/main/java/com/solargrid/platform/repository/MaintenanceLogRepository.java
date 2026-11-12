package com.solargrid.platform.repository;

import com.solargrid.platform.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    void deleteByDeviceId(Long deviceId);
    List<MaintenanceLog> findAllByOrderByCreatedAtDesc();
    List<MaintenanceLog> findByDeviceIdOrderByCreatedAtDesc(Long deviceId);
}
