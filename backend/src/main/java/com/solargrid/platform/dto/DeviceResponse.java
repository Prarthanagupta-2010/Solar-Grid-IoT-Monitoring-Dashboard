package com.solargrid.platform.dto;

import com.solargrid.platform.entity.*;
import java.time.Instant;
import java.time.LocalDate;

public record DeviceResponse(
        Long id,
        String name,
        String serialNumber,
        DeviceType type,
        String location,
        DeviceStatus status,
        int healthScore,
        Instant lastSeenAt,
        LocalDate installationDate,
        Instant createdAt
) {
    public static DeviceResponse from(Device device) {
        return new DeviceResponse(device.getId(), device.getName(), device.getSerialNumber(),
                device.getType(), device.getLocation(), device.getStatus(), device.getHealthScore(),
                device.getLastSeenAt(), device.getInstallationDate(), device.getCreatedAt());
    }
}

