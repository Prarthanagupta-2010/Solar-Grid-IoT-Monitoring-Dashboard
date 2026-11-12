package com.solargrid.platform.dto;

import com.solargrid.platform.entity.AlertStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AlertUpdateRequest(
        @NotNull AlertStatus status,
        @Size(max = 500) String resolutionNote
) {}

