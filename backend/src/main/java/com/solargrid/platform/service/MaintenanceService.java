package com.solargrid.platform.service;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.entity.*;
import com.solargrid.platform.repository.MaintenanceLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceLogRepository logRepository;
    private final DeviceService deviceService;

    public MaintenanceService(MaintenanceLogRepository logRepository, DeviceService deviceService) {
        this.logRepository = logRepository;
        this.deviceService = deviceService;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceLogResponse> findAll() {
        return logRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(MaintenanceLogResponse::from).toList();
    }

    @Transactional
    public MaintenanceLogResponse create(MaintenanceLogRequest request, Authentication authentication) {
        Device device = deviceService.getEntity(request.deviceId());
        MaintenanceLog log = new MaintenanceLog();
        log.setDevice(device);
        log.setEngineerName(authentication.getName());
        log.setType(request.type());
        log.setNote(request.note().trim());
        if (request.type() == MaintenanceType.CORRECTIVE) {
            device.setStatus(DeviceStatus.MAINTENANCE);
        }
        return MaintenanceLogResponse.from(logRepository.save(log));
    }
}

