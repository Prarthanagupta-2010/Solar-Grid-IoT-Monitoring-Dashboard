package com.solargrid.platform.dto;

import com.solargrid.platform.entity.*;
import java.time.Instant;

public record AlertResponse(
        Long id,
        Long deviceId,
        String deviceName,
        AlertType type,
        Severity severity,
        String message,
        AlertStatus status,
        Instant createdAt,
        Instant resolvedAt,
        String resolutionNote
) {
    public static AlertResponse from(Alert alert) {
        return new AlertResponse(alert.getId(), alert.getDevice().getId(), alert.getDevice().getName(),
                alert.getType(), alert.getSeverity(), alert.getMessage(), alert.getStatus(),
                alert.getCreatedAt(), alert.getResolvedAt(), alert.getResolutionNote());
    }
}

