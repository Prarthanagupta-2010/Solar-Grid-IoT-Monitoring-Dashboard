package com.solargrid.platform.service;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.entity.*;
import com.solargrid.platform.exception.ResourceNotFoundException;
import com.solargrid.platform.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AlertService {

    private static final List<AlertStatus> ACTIVE = List.of(AlertStatus.OPEN, AlertStatus.IN_PROGRESS);
    private final AlertRepository alertRepository;
    private final DeviceHealthService healthService;

    public AlertService(AlertRepository alertRepository, DeviceHealthService healthService) {
        this.alertRepository = alertRepository;
        this.healthService = healthService;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findAll() {
        return alertRepository.findAllByOrderByCreatedAtDesc().stream().map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> findActive() {
        return alertRepository.findByStatusInOrderByCreatedAtDesc(ACTIVE).stream().map(AlertResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> securityEvents() {
        return alertRepository.findByTypeInOrderByCreatedAtDesc(List.of(
                        AlertType.FALSE_DATA_INJECTION, AlertType.SUSPICIOUS_METER_READING,
                        AlertType.DEVICE_OFFLINE, AlertType.VOLTAGE_ANOMALY))
                .stream().map(AlertResponse::from).toList();
    }

    @Transactional
    public AlertResponse update(Long id, AlertUpdateRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        alert.setStatus(request.status());
        alert.setResolutionNote(request.resolutionNote());
        alert.setResolvedAt(request.status() == AlertStatus.RESOLVED || request.status() == AlertStatus.IGNORED
                ? Instant.now() : null);
        Alert saved = alertRepository.save(alert);
        if (alert.getType() == AlertType.DEVICE_OFFLINE && request.status() == AlertStatus.RESOLVED) {
            alert.getDevice().setStatus(DeviceStatus.ONLINE);
        }
        healthService.refresh(alert.getDevice());
        return AlertResponse.from(saved);
    }
}

