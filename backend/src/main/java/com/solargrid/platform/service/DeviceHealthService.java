package com.solargrid.platform.service;

import com.solargrid.platform.entity.*;
import com.solargrid.platform.repository.AlertRepository;
import com.solargrid.platform.repository.DeviceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeviceHealthService {

    private static final List<AlertStatus> ACTIVE = List.of(AlertStatus.OPEN, AlertStatus.IN_PROGRESS);
    private final AlertRepository alertRepository;
    private final DeviceRepository deviceRepository;

    public DeviceHealthService(AlertRepository alertRepository, DeviceRepository deviceRepository) {
        this.alertRepository = alertRepository;
        this.deviceRepository = deviceRepository;
    }

    public void refresh(Device device) {
        List<Alert> alerts = alertRepository.findByDeviceIdAndStatusIn(device.getId(), ACTIVE);
        int penalty = alerts.stream().mapToInt(alert -> switch (alert.getSeverity()) {
            case LOW -> 5;
            case MEDIUM -> 10;
            case HIGH -> 20;
            case CRITICAL -> 30;
        }).sum();

        if (device.getStatus() == DeviceStatus.OFFLINE) penalty += 40;
        if (device.getStatus() == DeviceStatus.MAINTENANCE) penalty += 15;
        int score = Math.max(5, 100 - Math.min(95, penalty));
        device.setHealthScore(score);

        if (device.getStatus() != DeviceStatus.OFFLINE && device.getStatus() != DeviceStatus.MAINTENANCE) {
            boolean critical = alerts.stream().anyMatch(a -> a.getSeverity() == Severity.CRITICAL);
            device.setStatus(critical || score < 50 ? DeviceStatus.CRITICAL
                    : score < 85 ? DeviceStatus.WARNING : DeviceStatus.ONLINE);
        }
        deviceRepository.save(device);
    }
}
