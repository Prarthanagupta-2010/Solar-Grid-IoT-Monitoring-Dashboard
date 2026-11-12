package com.solargrid.platform.service;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.entity.*;
import com.solargrid.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final List<AlertStatus> ACTIVE = List.of(AlertStatus.OPEN, AlertStatus.IN_PROGRESS);
    private final DeviceRepository deviceRepository;
    private final SensorReadingRepository readingRepository;
    private final AlertRepository alertRepository;

    public DashboardService(DeviceRepository deviceRepository, SensorReadingRepository readingRepository,
                            AlertRepository alertRepository) {
        this.deviceRepository = deviceRepository;
        this.readingRepository = readingRepository;
        this.alertRepository = alertRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary() {
        Instant dayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        List<Device> devices = deviceRepository.findAll();
        List<SensorReading> latest = readingRepository.findTop100ByOrderByCreatedAtDesc();

        double averageHealth = devices.stream().mapToInt(Device::getHealthScore).average().orElse(100);
        double averageTemperature = latest.stream()
                .filter(r -> r.getDevice().getType() == DeviceType.SOLAR_PANEL)
                .mapToDouble(SensorReading::getTemperature).average().orElse(0);
        double averageBattery = latest.stream()
                .filter(r -> r.getDevice().getType() == DeviceType.BATTERY)
                .mapToDouble(SensorReading::getBatteryLevel).average().orElse(0);

        return new DashboardSummary(
                devices.size(),
                deviceRepository.countByStatus(DeviceStatus.ONLINE),
                deviceRepository.countByStatus(DeviceStatus.OFFLINE),
                deviceRepository.countByStatus(DeviceStatus.WARNING) + deviceRepository.countByStatus(DeviceStatus.CRITICAL),
                round(readingRepository.sumEnergyOutputAfter(dayStart)),
                alertRepository.countByStatusIn(ACTIVE),
                alertRepository.countBySeverityAndStatusIn(Severity.CRITICAL, ACTIVE),
                readingRepository.countByAnomalousTrueAndCreatedAtAfter(dayStart),
                round(averageHealth), round(averageTemperature), round(averageBattery));
    }

    @Transactional(readOnly = true)
    public List<EnergyPoint> energyProduction(int hours) {
        int safeHours = Math.max(1, Math.min(hours, 168));
        Instant after = Instant.now().minus(safeHours, ChronoUnit.HOURS);
        Map<Instant, List<SensorReading>> grouped = readingRepository.findAllAfter(after).stream()
                .collect(Collectors.groupingBy(r -> r.getCreatedAt().truncatedTo(ChronoUnit.HOURS), TreeMap::new, Collectors.toList()));
        return grouped.entrySet().stream().map(entry -> new EnergyPoint(
                entry.getKey(),
                round(entry.getValue().stream().mapToDouble(SensorReading::getEnergyOutput).sum()),
                round(entry.getValue().stream().mapToDouble(SensorReading::getPower).sum())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AnomalyStatistics anomalyStatistics() {
        List<Alert> alerts = alertRepository.findAll();
        Map<String, Long> severity = Arrays.stream(Severity.values())
                .collect(Collectors.toMap(Enum::name,
                        value -> alerts.stream().filter(a -> a.getSeverity() == value).count(),
                        (a, b) -> a, LinkedHashMap::new));
        Map<String, Long> types = alerts.stream().collect(Collectors.groupingBy(
                alert -> alert.getType().name(), LinkedHashMap::new, Collectors.counting()));
        return new AnomalyStatistics(alerts.size(), severity, types);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

