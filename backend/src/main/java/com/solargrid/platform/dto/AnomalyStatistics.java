package com.solargrid.platform.dto;

import java.util.Map;

public record AnomalyStatistics(
        long total,
        Map<String, Long> bySeverity,
        Map<String, Long> byType
) {}

