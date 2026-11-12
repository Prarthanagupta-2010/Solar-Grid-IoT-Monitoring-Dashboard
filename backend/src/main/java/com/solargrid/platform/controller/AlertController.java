package com.solargrid.platform.controller;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertResponse> findAll() {
        return alertService.findAll();
    }

    @GetMapping("/active")
    public List<AlertResponse> findActive() {
        return alertService.findActive();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ENGINEER','OPERATOR')")
    public AlertResponse update(@PathVariable Long id, @Valid @RequestBody AlertUpdateRequest request) {
        return alertService.update(id, request);
    }
}

