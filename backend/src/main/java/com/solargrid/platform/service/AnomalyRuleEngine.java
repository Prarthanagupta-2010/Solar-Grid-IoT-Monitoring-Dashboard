package com.solargrid.platform.service;

import com.solargrid.platform.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AnomalyRuleEngine {

    public record Detection(AlertType type, Severity severity, String message) {}

    public List<Detection> evaluate(Device device, SensorReading current, SensorReading previous) {
        List<Detection> detections = new ArrayList<>();

        if (device.getStatus() == DeviceStatus.OFFLINE) {
            detections.add(new Detection(AlertType.DEVICE_OFFLINE, Severity.CRITICAL,
                    device.getName() + " stopped reporting telemetry."));
            return detections;
        }

        if (current.getTemperature() > 75.0) {
            detections.add(new Detection(AlertType.HIGH_TEMPERATURE, Severity.HIGH,
                    String.format("Temperature reached %.1f °C; safe limit is 75 °C.", current.getTemperature())));
        }

        if (device.getType() == DeviceType.BATTERY && current.getBatteryLevel() < 20.0) {
            detections.add(new Detection(AlertType.LOW_BATTERY, Severity.HIGH,
                    String.format("Battery level dropped to %.1f%%.", current.getBatteryLevel())));
        }

        if (isElectrical(device.getType()) && (current.getVoltage() < 180.0 || current.getVoltage() > 260.0)) {
            detections.add(new Detection(AlertType.VOLTAGE_ANOMALY, Severity.CRITICAL,
                    String.format("Voltage %.1f V is outside the safe 180–260 V range.", current.getVoltage())));
        }

        if (usesGridFrequency(device.getType())
                && (current.getFrequency() < 49.5 || current.getFrequency() > 50.5)) {
            detections.add(new Detection(AlertType.FREQUENCY_ANOMALY, Severity.CRITICAL,
                    String.format("Grid frequency %.2f Hz is outside the safe range.", current.getFrequency())));
        }

        if (previous != null && previous.getPower() > 0.5
                && current.getPower() < previous.getPower() * 0.60) {
            detections.add(new Detection(AlertType.PRODUCTION_DROP, Severity.MEDIUM,
                    String.format("Power output dropped by more than 40%% (%.2f → %.2f kW).",
                            previous.getPower(), current.getPower())));
        }

        double physicalPowerLimit = current.getVoltage() * current.getCurrent() / 1000.0 * 1.30;
        if (isElectrical(device.getType()) && current.getPower() > physicalPowerLimit + 0.5) {
            detections.add(new Detection(AlertType.FALSE_DATA_INJECTION, Severity.CRITICAL,
                    "Power telemetry is inconsistent with measured voltage and current."));
        }

        if (device.getType() == DeviceType.SMART_METER && current.getEnergyOutput() > 4.0) {
            detections.add(new Detection(AlertType.SUSPICIOUS_METER_READING, Severity.HIGH,
                    "Smart-meter energy delta exceeds the expected interval range."));
        }

        return detections;
    }

    private boolean isElectrical(DeviceType type) {
        return type != DeviceType.WEATHER_SENSOR;
    }

    private boolean usesGridFrequency(DeviceType type) {
        return type == DeviceType.INVERTER || type == DeviceType.SMART_METER || type == DeviceType.GRID_NODE;
    }
}

