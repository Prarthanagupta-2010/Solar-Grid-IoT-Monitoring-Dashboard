package com.solargrid.platform.dto;

import com.solargrid.platform.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRequest(
        @NotNull Role role,
        @NotNull Boolean enabled
) {}

