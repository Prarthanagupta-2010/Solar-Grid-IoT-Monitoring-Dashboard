package com.solargrid.platform.dto;

import com.solargrid.platform.entity.MaintenanceLog;
import com.solargrid.platform.entity.MaintenanceType;
import java.time.Instant;

public record MaintenanceLogResponse(
        Long id,
        Long deviceId,
        String deviceName,
        String engineerName,
        MaintenanceType type,
        String note,
        Instant createdAt
) {
    public static MaintenanceLogResponse from(MaintenanceLog log) {
        return new MaintenanceLogResponse(log.getId(), log.getDevice().getId(), log.getDevice().getName(),
                log.getEngineerName(), log.getType(), log.getNote(), log.getCreatedAt());
    }
}

