package com.solargrid.platform.dto;

public record DashboardSummary(
        long totalDevices,
        long onlineDevices,
        long offlineDevices,
        long warningDevices,
        double dailyEnergyKwh,
        long activeAlerts,
        long criticalAlerts,
        long anomaliesToday,
        double averageHealthScore,
        double averagePanelTemperature,
        double averageBatteryLevel
) {}

