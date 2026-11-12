package com.solargrid.platform.config;

import com.solargrid.platform.entity.*;
import com.solargrid.platform.repository.*;
import com.solargrid.platform.service.SensorSimulationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final MaintenanceLogRepository maintenanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final SensorSimulationService simulationService;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(UserRepository userRepository, DeviceRepository deviceRepository,
                           MaintenanceLogRepository maintenanceRepository, PasswordEncoder passwordEncoder,
                           SensorSimulationService simulationService,
                           @Value("${app.admin.email}") String adminEmail,
                           @Value("${app.admin.password}") String adminPassword) {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.simulationService = simulationService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedUsers();
        seedDevices();
        seedMaintenance();
        simulationService.seedHistory(30);
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;
        userRepository.saveAll(List.of(
                user("System Administrator", adminEmail, adminPassword, Role.ADMIN),
                user("Grid Engineer", "engineer@solargrid.local", "Engineer123!", Role.ENGINEER),
                user("Control Operator", "operator@solargrid.local", "Operator123!", Role.OPERATOR),
                user("Research Viewer", "viewer@solargrid.local", "Viewer123!", Role.VIEWER)
        ));
    }

    private AppUser user(String name, String email, String password, Role role) {
        AppUser user = new AppUser();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        return user;
    }

    private void seedDevices() {
        if (deviceRepository.count() > 0) return;
        deviceRepository.saveAll(List.of(
                device("Solar Array A1", "SP-A1-2026", DeviceType.SOLAR_PANEL, "North Field · Row A", 97, 420),
                device("Solar Array A2", "SP-A2-2026", DeviceType.SOLAR_PANEL, "North Field · Row A", 94, 390),
                device("Solar Array B1", "SP-B1-2025", DeviceType.SOLAR_PANEL, "South Field · Row B", 91, 510),
                device("Main Inverter 01", "INV-01-2026", DeviceType.INVERTER, "Inverter Station", 89, 310),
                device("Battery Bank 01", "BAT-01-2026", DeviceType.BATTERY, "Storage Building", 86, 265),
                device("Smart Meter 01", "MTR-01-2025", DeviceType.SMART_METER, "Point of Common Coupling", 93, 480),
                device("Weather Station", "WTH-01-2026", DeviceType.WEATHER_SENSOR, "North Field", 98, 180),
                device("Grid Connection", "GRD-01-2025", DeviceType.GRID_NODE, "Main Substation", 88, 620)
        ));
    }

    private Device device(String name, String serial, DeviceType type, String location,
                          int health, int daysAgo) {
        Device device = new Device();
        device.setName(name);
        device.setSerialNumber(serial);
        device.setType(type);
        device.setLocation(location);
        device.setStatus(DeviceStatus.ONLINE);
        device.setHealthScore(health);
        device.setInstallationDate(LocalDate.now().minusDays(daysAgo));
        return device;
    }

    private void seedMaintenance() {
        if (maintenanceRepository.count() > 0 || deviceRepository.count() == 0) return;
        Device device = deviceRepository.findAllByOrderByNameAsc().get(0);
        MaintenanceLog log = new MaintenanceLog();
        log.setDevice(device);
        log.setEngineerName("engineer@solargrid.local");
        log.setType(MaintenanceType.INSPECTION);
        log.setNote("Routine visual inspection completed. Connectors and thermal condition are normal.");
        maintenanceRepository.save(log);
    }
}
