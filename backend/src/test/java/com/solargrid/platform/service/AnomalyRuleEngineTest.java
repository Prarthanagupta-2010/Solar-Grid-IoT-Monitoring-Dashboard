package com.solargrid.platform.service;

import com.solargrid.platform.entity.*;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AnomalyRuleEngineTest {

    private final AnomalyRuleEngine engine = new AnomalyRuleEngine();

    @Test
    void detectsHighTemperatureAndUnsafeVoltage() {
        Device device = device(DeviceType.INVERTER, DeviceStatus.ONLINE);
        SensorReading reading = normalReading(device);
        reading.setTemperature(82);
        reading.setVoltage(275);

        List<AnomalyRuleEngine.Detection> detections = engine.evaluate(device, reading, null);

        assertThat(detections).extracting(AnomalyRuleEngine.Detection::type)
                .contains(AlertType.HIGH_TEMPERATURE, AlertType.VOLTAGE_ANOMALY);
    }

    @Test
    void detectsFalseDataInjectionFromPhysicallyInconsistentPower() {
        Device device = device(DeviceType.SMART_METER, DeviceStatus.ONLINE);
        SensorReading reading = normalReading(device);
        reading.setVoltage(230);
        reading.setCurrent(5);
        reading.setPower(9);

        assertThat(engine.evaluate(device, reading, null))
                .extracting(AnomalyRuleEngine.Detection::type)
                .contains(AlertType.FALSE_DATA_INJECTION);
    }

    @Test
    void acceptsNormalTelemetry() {
        Device device = device(DeviceType.SOLAR_PANEL, DeviceStatus.ONLINE);
        SensorReading reading = normalReading(device);

        assertThat(engine.evaluate(device, reading, null)).isEmpty();
    }

    private Device device(DeviceType type, DeviceStatus status) {
        Device device = new Device();
        device.setId(1L);
        device.setName("Test Device");
        device.setType(type);
        device.setStatus(status);
        return device;
    }

    private SensorReading normalReading(Device device) {
        SensorReading reading = new SensorReading();
        reading.setDevice(device);
        reading.setVoltage(230);
        reading.setCurrent(10);
        reading.setPower(2.1);
        reading.setTemperature(42);
        reading.setBatteryLevel(80);
        reading.setFrequency(50);
        reading.setEnergyOutput(0.2);
        return reading;
    }
}

