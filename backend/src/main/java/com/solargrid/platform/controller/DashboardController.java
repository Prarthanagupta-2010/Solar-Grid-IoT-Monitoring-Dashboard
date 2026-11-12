package com.solargrid.platform.controller;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.service.DashboardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary summary() {
        return dashboardService.summary();
    }

    @GetMapping("/energy-production")
    public List<EnergyPoint> energyProduction(@RequestParam(defaultValue = "24") int hours) {
        return dashboardService.energyProduction(hours);
    }

    @GetMapping("/anomaly-statistics")
    public AnomalyStatistics anomalyStatistics() {
        return dashboardService.anomalyStatistics();
    }
}

