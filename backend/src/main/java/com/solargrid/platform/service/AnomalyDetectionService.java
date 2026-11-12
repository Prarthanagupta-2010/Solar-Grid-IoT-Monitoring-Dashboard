package com.solargrid.platform.service;

import com.solargrid.platform.entity.*;
import com.solargrid.platform.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnomalyDetectionService {

    private static final List<AlertStatus> ACTIVE = List.of(AlertStatus.OPEN, AlertStatus.IN_PROGRESS);
    private final AnomalyRuleEngine ruleEngine;
    private final AlertRepository alertRepository;
    private final DeviceHealthService healthService;

    public AnomalyDetectionService(AnomalyRuleEngine ruleEngine, AlertRepository alertRepository,
                                   DeviceHealthService healthService) {
        this.ruleEngine = ruleEngine;
        this.alertRepository = alertRepository;
        this.healthService = healthService;
    }

    public List<AnomalyRuleEngine.Detection> analyze(Device device, SensorReading current,
                                                     SensorReading previous) {
        List<AnomalyRuleEngine.Detection> detections = ruleEngine.evaluate(device, current, previous);
        current.setAnomalous(!detections.isEmpty());

        for (AnomalyRuleEngine.Detection detection : detections) {
            boolean exists = alertRepository.existsByDeviceIdAndTypeAndStatusIn(
                    device.getId(), detection.type(), ACTIVE);
            if (!exists) {
                Alert alert = new Alert();
                alert.setDevice(device);
                alert.setType(detection.type());
                alert.setSeverity(detection.severity());
                alert.setMessage(detection.message());
                alertRepository.save(alert);
            }
        }
        healthService.refresh(device);
        return detections;
    }
}

