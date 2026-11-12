package com.solargrid.platform.dto;

import com.solargrid.platform.entity.AppUser;
import com.solargrid.platform.entity.Role;
import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean enabled,
        Instant createdAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole(), user.isEnabled(), user.getCreatedAt());
    }
}

