package com.solargrid.platform.dto;

import com.solargrid.platform.entity.MaintenanceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MaintenanceLogRequest(
        @NotNull Long deviceId,
        @NotNull MaintenanceType type,
        @NotBlank @Size(max = 1000) String note
) {}

