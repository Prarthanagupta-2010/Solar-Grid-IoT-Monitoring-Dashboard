package com.solargrid.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sensor_readings", indexes = {
        @Index(name = "idx_reading_device_created", columnList = "device_id,created_at")
})
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    private double voltage;
    private double current;
    private double power;
    private double temperature;
    private double humidity;
    private double batteryLevel;
    private double frequency;
    private double energyOutput;

    @Column(nullable = false)
    private boolean anomalous;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }
    public double getVoltage() { return voltage; }
    public void setVoltage(double voltage) { this.voltage = voltage; }
    public double getCurrent() { return current; }
    public void setCurrent(double current) { this.current = current; }
    public double getPower() { return power; }
    public void setPower(double power) { this.power = power; }
    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }
    public double getHumidity() { return humidity; }
    public void setHumidity(double humidity) { this.humidity = humidity; }
    public double getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(double batteryLevel) { this.batteryLevel = batteryLevel; }
    public double getFrequency() { return frequency; }
    public void setFrequency(double frequency) { this.frequency = frequency; }
    public double getEnergyOutput() { return energyOutput; }
    public void setEnergyOutput(double energyOutput) { this.energyOutput = energyOutput; }
    public boolean isAnomalous() { return anomalous; }
    public void setAnomalous(boolean anomalous) { this.anomalous = anomalous; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

