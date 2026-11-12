package com.solargrid.platform.dto;

import com.solargrid.platform.entity.SensorReading;
import java.time.Instant;

public record SensorReadingResponse(
        Long id,
        Long deviceId,
        String deviceName,
        double voltage,
        double current,
        double power,
        double temperature,
        double humidity,
        double batteryLevel,
        double frequency,
        double energyOutput,
        boolean anomalous,
        Instant createdAt
) {
    public static SensorReadingResponse from(SensorReading reading) {
        return new SensorReadingResponse(reading.getId(), reading.getDevice().getId(),
                reading.getDevice().getName(), reading.getVoltage(), reading.getCurrent(),
                reading.getPower(), reading.getTemperature(), reading.getHumidity(),
                reading.getBatteryLevel(), reading.getFrequency(), reading.getEnergyOutput(),
                reading.isAnomalous(), reading.getCreatedAt());
    }
}

