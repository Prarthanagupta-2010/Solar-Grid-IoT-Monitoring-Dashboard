package com.solargrid.platform.controller;

import com.solargrid.platform.dto.*;
import com.solargrid.platform.service.DeviceService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public List<DeviceResponse> findAll() {
        return deviceService.findAll();
    }

    @GetMapping("/{id}")
    public DeviceResponse findById(@PathVariable Long id) {
        return deviceService.findById(id);
    }

    @GetMapping("/{id}/readings")
    public List<SensorReadingResponse> readings(@PathVariable Long id,
                                                @RequestParam(defaultValue = "100") int limit) {
        return deviceService.readings(id, limit);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ENGINEER')")
    public ResponseEntity<DeviceResponse> create(@Valid @RequestBody DeviceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deviceService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ENGINEER')")
    public DeviceResponse update(@PathVariable Long id, @Valid @RequestBody DeviceRequest request) {
        return deviceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        deviceService.delete(id);
    }
}

