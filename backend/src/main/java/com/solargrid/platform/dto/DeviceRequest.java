package com.solargrid.platform.dto;

import com.solargrid.platform.entity.DeviceStatus;
import com.solargrid.platform.entity.DeviceType;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record DeviceRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 80) String serialNumber,
        @NotNull DeviceType type,
        @NotBlank @Size(max = 160) String location,
        DeviceStatus status,
        @Min(0) @Max(100) Integer healthScore,
        @PastOrPresent LocalDate installationDate
) {}

