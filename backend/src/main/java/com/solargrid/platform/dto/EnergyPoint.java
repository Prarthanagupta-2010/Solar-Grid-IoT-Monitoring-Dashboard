package com.solargrid.platform.dto;

import java.time.Instant;

public record EnergyPoint(Instant timestamp, double energyKwh, double powerKw) {}

