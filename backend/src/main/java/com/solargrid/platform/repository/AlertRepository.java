package com.solargrid.platform.repository;

import com.solargrid.platform.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    void deleteByDeviceId(Long deviceId);
    List<Alert> findAllByOrderByCreatedAtDesc();
    List<Alert> findByStatusInOrderByCreatedAtDesc(Collection<AlertStatus> statuses);
    long countByStatusIn(Collection<AlertStatus> statuses);
    long countBySeverityAndStatusIn(Severity severity, Collection<AlertStatus> statuses);
    boolean existsByDeviceIdAndTypeAndStatusIn(Long deviceId, AlertType type, Collection<AlertStatus> statuses);
    List<Alert> findByDeviceIdAndStatusIn(Long deviceId, Collection<AlertStatus> statuses);
    List<Alert> findByTypeInOrderByCreatedAtDesc(Collection<AlertType> types);
}
