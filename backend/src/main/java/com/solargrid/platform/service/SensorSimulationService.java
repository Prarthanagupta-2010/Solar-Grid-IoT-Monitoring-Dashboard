package com.solargrid.platform.service;

import com.solargrid.platform.dto.SensorReadingResponse;
import com.solargrid.platform.entity.*;
import com.solargrid.platform.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class SensorSimulationService {

    private final DeviceRepository deviceRepository;
    private final SensorReadingRepository readingRepository;
    private final AnomalyDetectionService anomalyDetectionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final boolean simulationEnabled;

    public SensorSimulationService(DeviceRepository deviceRepository,
                                   SensorReadingRepository readingRepository,
                                   AnomalyDetectionService anomalyDetectionService,
                                   SimpMessagingTemplate messagingTemplate,
                                   @Value("${app.simulation.enabled:true}") boolean simulationEnabled) {
        this.deviceRepository = deviceRepository;
        this.readingRepository = readingRepository;
        this.anomalyDetectionService = anomalyDetectionService;
        this.messagingTemplate = messagingTemplate;
        this.simulationEnabled = simulationEnabled;
    }

    @Scheduled(fixedDelayString = "${app.simulation.interval-ms:5000}")
    @Transactional
    public void scheduledSimulation() {
        if (simulationEnabled) simulateAll(true);
    }

    @Transactional
    public List<SensorReadingResponse> simulateNow() {
        return simulateAll(true);
    }

    @Transactional
    public void seedHistory(int cycles) {
        if (readingRepository.count() > 0) return;
        List<Device> devices = deviceRepository.findAllByOrderByNameAsc();
        Instant start = Instant.now().minus(cycles, ChronoUnit.HOURS);
        Map<Long, SensorReading> previousByDevice = new HashMap<>();
        for (int i = 0; i < cycles; i++) {
            Instant timestamp = start.plus(i, ChronoUnit.HOURS);
            for (Device device : devices) {
                SensorReading reading = generateReading(device, timestamp, false);
                SensorReading previous = previousByDevice.get(device.getId());
                anomalyDetectionService.analyze(device, reading, previous);
                readingRepository.save(reading);
                previousByDevice.put(device.getId(), reading);
            }
        }
    }

    private List<SensorReadingResponse> simulateAll(boolean allowAnomaly) {
        List<SensorReadingResponse> result = new ArrayList<>();
        for (Device device : deviceRepository.findAllByOrderByNameAsc()) {
            if (device.getStatus() == DeviceStatus.MAINTENANCE) continue;

            SensorReading previous = readingRepository.findTopByDeviceIdOrderByCreatedAtDesc(device.getId())
                    .orElse(null);
            SensorReading reading = generateReading(device, Instant.now(), allowAnomaly);
            anomalyDetectionService.analyze(device, reading, previous);
            reading = readingRepository.save(reading);
            SensorReadingResponse response = SensorReadingResponse.from(reading);
            result.add(response);
            messagingTemplate.convertAndSend("/topic/readings", response);
        }
        return result;
    }

    private SensorReading generateReading(Device device, Instant timestamp, boolean allowAnomaly) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        boolean offline = allowAnomaly && random.nextDouble() < 0.015;
        device.setStatus(offline ? DeviceStatus.OFFLINE : DeviceStatus.ONLINE);
        device.setLastSeenAt(timestamp);

        SensorReading reading = new SensorReading();
        reading.setDevice(device);
        reading.setCreatedAt(timestamp);
        if (offline) return reading;

        double daylight = Math.max(0.12, Math.sin((timestamp.atZone(java.time.ZoneOffset.UTC).getHour() - 6) * Math.PI / 12));
        double voltage = device.getType() == DeviceType.WEATHER_SENSOR ? 0 : between(random, 224, 238);
        double current = switch (device.getType()) {
            case SOLAR_PANEL -> between(random, 4, 11) * daylight;
            case INVERTER -> between(random, 12, 24) * daylight;
            case BATTERY -> between(random, 5, 16);
            case SMART_METER, GRID_NODE -> between(random, 15, 28) * daylight;
            case WEATHER_SENSOR -> 0;
        };
        double power = voltage * current / 1000.0 * between(random, 0.88, 0.97);
        double temperature = switch (device.getType()) {
            case SOLAR_PANEL -> between(random, 35, 61);
            case INVERTER, BATTERY -> between(random, 28, 46);
            default -> between(random, 20, 36);
        };
        double battery = device.getType() == DeviceType.BATTERY ? between(random, 52, 96) : 100;
        double frequency = usesGridFrequency(device.getType()) ? between(random, 49.88, 50.12) : 50;
        double energyDelta = Math.max(0, power / 12.0);

        if (allowAnomaly && random.nextDouble() < 0.09) {
            int anomaly = random.nextInt(6);
            switch (anomaly) {
                case 0 -> temperature = between(random, 78, 92);
                case 1 -> voltage = random.nextBoolean() ? between(random, 150, 175) : between(random, 270, 295);
                case 2 -> frequency = random.nextBoolean() ? between(random, 48.7, 49.3) : between(random, 50.7, 51.4);
                case 3 -> {
                    if (device.getType() == DeviceType.BATTERY) battery = between(random, 5, 17);
                    else power *= 0.25;
                }
                case 4 -> power = voltage * Math.max(current, 1) / 1000.0 * 2.2;
                default -> {
                    if (device.getType() == DeviceType.SMART_METER) energyDelta = between(random, 4.5, 7.0);
                    else power *= 0.3;
                }
            }
        }

        reading.setVoltage(round(voltage));
        reading.setCurrent(round(current));
        reading.setPower(round(power));
        reading.setTemperature(round(temperature));
        reading.setHumidity(round(between(random, 30, 68)));
        reading.setBatteryLevel(round(battery));
        reading.setFrequency(round(frequency));
        reading.setEnergyOutput(round(energyDelta));
        return reading;
    }

    private boolean usesGridFrequency(DeviceType type) {
        return type == DeviceType.INVERTER || type == DeviceType.SMART_METER || type == DeviceType.GRID_NODE;
    }

    private double between(ThreadLocalRandom random, double min, double max) {
        return random.nextDouble(min, max);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
