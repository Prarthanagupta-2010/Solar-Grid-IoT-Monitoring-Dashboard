package com.solargrid.platform.controller;

import com.solargrid.platform.dto.SensorReadingResponse;
import com.solargrid.platform.repository.SensorReadingRepository;
import com.solargrid.platform.service.SensorSimulationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensor-readings")
public class SensorReadingController {

    private final SensorReadingRepository readingRepository;
    private final SensorSimulationService simulationService;

    public SensorReadingController(SensorReadingRepository readingRepository,
                                   SensorSimulationService simulationService) {
        this.readingRepository = readingRepository;
        this.simulationService = simulationService;
    }

    @GetMapping("/latest")
    @Transactional(readOnly = true)
    public List<SensorReadingResponse> latest() {
        return readingRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(SensorReadingResponse::from).toList();
    }

    @PostMapping("/simulate")
    @PreAuthorize("hasAnyRole('ADMIN','ENGINEER','OPERATOR')")
    public List<SensorReadingResponse> simulate() {
        return simulationService.simulateNow();
    }
}

