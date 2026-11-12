package com.solargrid.platform.controller;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.service.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class InsightController {

    private final DeviceService deviceService;
    private final AlertService alertService;

    public InsightController(DeviceService deviceService, AlertService alertService) {
        this.deviceService = deviceService;
        this.alertService = alertService;
    }

    @GetMapping("/api/health-scores")
    public List<DeviceResponse> healthScores() {
        return deviceService.findAll();
    }

    @GetMapping("/api/security-events")
    public List<AlertResponse> securityEvents() {
        return alertService.securityEvents();
    }
}

