package com.solargrid.platform.service;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.entity.*;
import com.solargrid.platform.exception.*;
import com.solargrid.platform.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final SensorReadingRepository readingRepository;
    private final AlertRepository alertRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    public DeviceService(DeviceRepository deviceRepository, SensorReadingRepository readingRepository,
                         AlertRepository alertRepository, MaintenanceLogRepository maintenanceLogRepository) {
        this.deviceRepository = deviceRepository;
        this.readingRepository = readingRepository;
        this.alertRepository = alertRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> findAll() {
        return deviceRepository.findAllByOrderByNameAsc().stream().map(DeviceResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public DeviceResponse findById(Long id) {
        return DeviceResponse.from(getEntity(id));
    }

    @Transactional
    public DeviceResponse create(DeviceRequest request) {
        if (deviceRepository.existsBySerialNumberIgnoreCase(request.serialNumber())) {
            throw new ConflictException("A device with this serial number already exists");
        }
        Device device = new Device();
        apply(device, request);
        return DeviceResponse.from(deviceRepository.save(device));
    }

    @Transactional
    public DeviceResponse update(Long id, DeviceRequest request) {
        Device device = getEntity(id);
        if (!device.getSerialNumber().equalsIgnoreCase(request.serialNumber())
                && deviceRepository.existsBySerialNumberIgnoreCase(request.serialNumber())) {
            throw new ConflictException("A device with this serial number already exists");
        }
        apply(device, request);
        return DeviceResponse.from(deviceRepository.save(device));
    }

    @Transactional
    public void delete(Long id) {
        Device device = getEntity(id);
        maintenanceLogRepository.deleteByDeviceId(id);
        alertRepository.deleteByDeviceId(id);
        readingRepository.deleteByDeviceId(id);
        deviceRepository.delete(device);
    }

    @Transactional(readOnly = true)
    public List<SensorReadingResponse> readings(Long deviceId, int limit) {
        getEntity(deviceId);
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return readingRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId, PageRequest.of(0, safeLimit))
                .stream().map(SensorReadingResponse::from).toList();
    }

    public Device getEntity(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + id));
    }

    private void apply(Device device, DeviceRequest request) {
        device.setName(request.name().trim());
        device.setSerialNumber(request.serialNumber().trim().toUpperCase());
        device.setType(request.type());
        device.setLocation(request.location().trim());
        device.setStatus(request.status() == null ? DeviceStatus.ONLINE : request.status());
        device.setHealthScore(request.healthScore() == null ? 100 : request.healthScore());
        device.setInstallationDate(request.installationDate() == null ? LocalDate.now() : request.installationDate());
    }
}
